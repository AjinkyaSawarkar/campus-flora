/**
 * Campus Flora – photo contributions.
 *
 * This script lives inside a Google Sheet (Extensions -> Apps Script). It
 *   - receives photos sent from the website's "Add a photo" page, saves them in a Drive folder
 *     and adds one row per photo to the "Submissions" tab;
 *   - gives the website the list of photos whose "Approved" box is ticked.
 * Setup steps are in contributions/README.md.
 */

// ---- settings you may change -------------------------------------------------------------
var FOLDER_NAME = "Campus Flora uploads";   // Drive folder for the photos (created automatically)
var MAX_PER_DAY = 300;                      // stop accepting uploads after this many in one day
// Plants whose location is never sent to the website (poaching risk). Names as shown on the site.
var HIDE_LOCATION = ["Red Sanders", "Sandalwood"];
// -------------------------------------------------------------------------------------------

var SHEET = "Submissions";
var HEADERS = ["Time", "Photo", "Plant", "Contributor", "Suggested by Pl@ntNet", "Name check", "Approved",
               "Reviewer note", "Location", "Contributor's note", "Latitude", "Longitude", "Accuracy (m)", "File ID"];
var COL = { time: 1, photo: 2, plant: 3, by: 4, ai: 5, check: 6, approved: 7, reviewNote: 8, map: 9, note: 10, lat: 11, lng: 12, acc: 13, file: 14 };

/** Run once after pasting this script: creates the tabs, headers, tick boxes and the Drive folder. */
function setup() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET, 0);
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold").setBackground("#1f3a2b").setFontColor("#ffffff");
  sh.setFrozenRows(1);
  sh.setFrozenColumns(3);
  sh.setColumnWidth(COL.photo, 130);
  sh.setColumnWidth(COL.plant, 160);
  sh.setColumnWidth(COL.ai, 220);
  sh.setColumnWidth(COL.reviewNote, 200);
  sh.setColumnWidth(COL.note, 220);
  sh.getRange(2, COL.approved, sh.getMaxRows() - 1, 1).insertCheckboxes();
  sh.getRange(2, COL.time, sh.getMaxRows() - 1, 1).setNumberFormat("d mmm yyyy, h:mm");
  if (!sh.getFilter()) sh.getRange(1, 1, sh.getMaxRows(), HEADERS.length).createFilter();

  // Colour the "Name check" column so doubtful rows stand out.
  var checkCol = sh.getRange(2, COL.check, sh.getMaxRows() - 1, 1);
  sh.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenTextStartsWith("Agrees").setBackground("#d9ead3").setRanges([checkCol]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextStartsWith("Different").setBackground("#f4cccc").setRanges([checkCol]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextStartsWith("Not sure").setBackground("#fff2cc").setRanges([checkCol]).build()
  ]);

  // Summary tab: uploads and approved photos per plant.
  var sum = ss.getSheetByName("Summary") || ss.insertSheet("Summary");
  sum.clear();
  sum.getRange("A1").setFormula(
    '=QUERY({' + SHEET + '!C2:C, ARRAYFORMULA(N(' + SHEET + '!G2:G))}, ' +
    '"select Col1, count(Col1), sum(Col2) where Col1 is not null group by Col1 order by Col1 ' +
    'label Col1 \'Plant\', count(Col1) \'Uploads\', sum(Col2) \'Approved\'", 0)');
  sum.getRange("A1:C1").setFontWeight("bold");
  sum.setColumnWidth(1, 220);

  getFolder_();
  onOpen();
  SpreadsheetApp.getUi().alert("Ready. Now deploy: Deploy -> New deployment -> Web app -> Execute as: Me, Who has access: Anyone.");
}

/** Adds a "Campus Flora" menu to the sheet. */
function onOpen() {
  SpreadsheetApp.getUi().createMenu("Campus Flora")
    .addItem("Group by plant (A to Z)", "sortByPlant")
    .addItem("Newest first", "sortByNewest")
    .addItem("Show only photos waiting for review", "showWaiting")
    .addItem("Show all", "showAll")
    .addToUi();
}

function dataRange_() {
  var sh = SpreadsheetApp.getActive().getSheetByName(SHEET);
  var last = sh.getLastRow();
  return last < 2 ? null : sh.getRange(2, 1, last - 1, HEADERS.length);
}
function sortByPlant() { var r = dataRange_(); if (r) r.sort([{ column: COL.plant, ascending: true }, { column: COL.time, ascending: false }]); }
function sortByNewest() { var r = dataRange_(); if (r) r.sort([{ column: COL.time, ascending: false }]); }
function showWaiting() {
  var f = SpreadsheetApp.getActive().getSheetByName(SHEET).getFilter();
  if (f) f.setColumnFilterCriteria(COL.approved, SpreadsheetApp.newFilterCriteria().setHiddenValues(["TRUE"]).build());
}
function showAll() {
  var f = SpreadsheetApp.getActive().getSheetByName(SHEET).getFilter();
  if (f) f.removeColumnFilterCriteria(COL.approved);
}

function getFolder_() {
  var it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Text typed by a visitor: trimmed, shortened, and never treated as a formula by Sheets. */
function clean_(value, max) {
  var s = String(value == null ? "" : value).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function num_(v, min, max) {
  var n = Number(v);
  return v === "" || v == null || isNaN(n) || n < min || n > max ? "" : n;
}

/** The website sends one photo here. */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.consent !== true) return json_({ ok: false, error: "Please tick the permission box." });
    var plant = clean_(d.plant, 80), by = clean_(d.name, 60);
    if (!plant || !by) return json_({ ok: false, error: "Plant and your name are required." });
    if (!d.image || d.image.length > 5500000) return json_({ ok: false, error: "The photo is missing or too large." });

    var bytes = Utilities.base64Decode(d.image);
    if (bytes.length < 3 || (bytes[0] & 255) !== 0xff || (bytes[1] & 255) !== 0xd8) {
      return json_({ ok: false, error: "Only JPEG photos are accepted." });
    }

    lock.waitLock(20000);
    var sh = SpreadsheetApp.getActive().getSheetByName(SHEET);
    var tz = Session.getScriptTimeZone(), today = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd");
    var last = sh.getLastRow();
    if (last > 1) {
      var times = sh.getRange(Math.max(2, last - MAX_PER_DAY), COL.time, Math.min(last - 1, MAX_PER_DAY + 1), 1).getValues();
      var count = times.filter(function (t) { return t[0] instanceof Date && Utilities.formatDate(t[0], tz, "yyyy-MM-dd") === today; }).length;
      if (count >= MAX_PER_DAY) return json_({ ok: false, error: "Too many uploads today. Please try again tomorrow." });
    }

    var stamp = Utilities.formatDate(new Date(), tz, "yyyyMMdd-HHmmss");
    var fileName = plant.replace(/[^\w\- ]+/g, "").slice(0, 40) + " " + stamp + ".jpg";
    var file = getFolder_().createFile(Utilities.newBlob(bytes, "image/jpeg", fileName));
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); // lets the sheet and the site show it

    var lat = num_(d.lat, -90, 90), lng = num_(d.lng, -180, 180);
    var hasPlace = lat !== "" && lng !== "";
    var ai = clean_(d.aiName, 120);
    var check = d.aiMatch === "agrees" ? "Agrees" : d.aiMatch === "different" ? "Different" : d.aiMatch === "unsure" ? "Not sure" : "No suggestion";
    if (ai && d.aiScore) ai += " (" + Math.round(Number(d.aiScore) * 100) + "%)";

    var row = last + 1;
    sh.getRange(row, 1, 1, HEADERS.length).setValues([[
      new Date(), "", plant, by, ai, check, false, "",
      "", clean_(d.note, 300), hasPlace ? lat : "", hasPlace ? lng : "", num_(d.accuracy, 0, 100000), file.getId()
    ]]);
    sh.getRange(row, COL.photo).setFormula('=IMAGE("https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w300")');
    if (hasPlace) sh.getRange(row, COL.map).setFormula('=HYPERLINK("https://www.google.com/maps?q=' + lat + ',' + lng + '", "Open map")');
    sh.getRange(row, COL.approved).insertCheckboxes();
    sh.setRowHeight(row, 100);
    CacheService.getScriptCache().remove("approved");
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: "Could not save the photo. Please try again." , detail: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

/** The website asks here for the approved photos. */
function doGet() {
  var cache = CacheService.getScriptCache();
  var hit = cache.get("approved");
  if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);

  var r = dataRange_();
  var hide = HIDE_LOCATION.map(function (n) { return n.toLowerCase(); });
  var photos = [];
  (r ? r.getValues() : []).forEach(function (v) {
    if (v[COL.approved - 1] !== true || !v[COL.file - 1] || !v[COL.plant - 1]) return;
    var plant = String(v[COL.plant - 1]).trim();
    var showPlace = hide.indexOf(plant.toLowerCase()) < 0 && v[COL.lat - 1] !== "" && v[COL.lng - 1] !== "";
    photos.push({
      plant: plant,
      by: String(v[COL.by - 1]).replace(/^'/, ""),
      id: String(v[COL.file - 1]),
      date: v[COL.time - 1] instanceof Date ? v[COL.time - 1].toISOString() : "",
      lat: showPlace ? Number(v[COL.lat - 1]) : null,
      lng: showPlace ? Number(v[COL.lng - 1]) : null
    });
  });
  var body = JSON.stringify({ photos: photos });
  try { cache.put("approved", body, 60); } catch (tooBig) {}
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}
