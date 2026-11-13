import { Redirect, Route, Switch } from "wouter";
import Home from "./pages/Home";
import Flora from "./pages/Flora";
import Category from "./pages/Category";
import PlantPage from "./pages/Plant";
import About from "./pages/About";
import Contribute from "./pages/Contribute";
import MapPage from "./pages/MapPage";
import Guide from "./pages/Guide";
import TagRedirect from "./pages/TagRedirect";
import NotFound from "./pages/NotFound";
import Shell from "./components/Shell";
import Sprout from "./components/Sprout";
import { COLLECTION_REDIRECTS } from "./content/site";

export default function App() {
  return (
    <>
      <Shell>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/flora" component={Flora} />
          <Route path="/flora/:id">
            {(p) => (COLLECTION_REDIRECTS[p.id] ? <Redirect to={`/flora/${COLLECTION_REDIRECTS[p.id]}`} replace /> : <Category id={p.id} />)}
          </Route>
          <Route path="/plant/:slug">{(p) => <PlantPage slug={p.slug} />}</Route>
          <Route path="/p/:tag">{(p) => <TagRedirect tag={p.tag} />}</Route>
          <Route path="/contribute" component={Contribute} />
          <Route path="/map" component={MapPage} />
          <Route path="/guide" component={Guide} />
          <Route path="/about" component={About} />
          {/* Team and Contact now live on the About page. */}
          <Route path="/team"><Redirect to="/about#team" replace /></Route>
          <Route path="/contact"><Redirect to="/about#contact" replace /></Route>
          <Route component={NotFound} />
        </Switch>
      </Shell>
      <Sprout />
    </>
  );
}
