import React from 'react';
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  withRouter,
} from 'react-router-dom';

// This site has 3 pages, all of which are rendered
// dynamically in the browser (not server rendered).
//
// Although the page does not ever refresh, notice how
// React Router keeps the URL up to date as you navigate
// through the site. This preserves the browser history,
// making sure things like the back button and bookmarks
// work properly.

export default function App() {
  return (
    <Router>
      <div>
        {/* <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
        </ul> */}

        <hr />

        {/* <a href="http://en.wikipedia.org/wiki/Special:Random">Random Wiki Article</a> */}

        {/*
          A <Switch> looks through all its children <Route>
          elements and renders the first one whose path
          matches the current URL. Use a <Switch> any time
          you have multiple routes, but you want only one
          of them to render at a time
        */}
        {/* <Switch>
          <Route exact path="/">
            <Home /> 
            <RabbitHole /> 
          </Route>
          <Route path="/about">
            <About />
          </Route>
        </Switch> */}
        <RabbitHolePage />
      </div>
    </Router>
  );
}

// You can think of these components as "pages"
// in your app.

function Home() {
  return (
    <div>
      <h2>Home</h2>
    </div>
  );
}

function About() {
  return (
    <div>
      <h2>About</h2>
    </div>
  );
}

const RabbitHolePage = withRouter(
  class RabbitHole extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        wikiData: {},
      };
    }

    componentDidMount() {
      fetch(
        `https://en.wikipedia.org/api/rest_v1/page/random/mobile-sections`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
        .then((resp) => resp.json())
        .then((resp) => {
          console.log('resp', resp);

          this.setState({ wikiData: resp });
        });
    }

    /**
     * TODO Check for updates to the component so that we can detect
     * when there are changes to the URL. In our case, we want
     * to detect changes to the location search params and render
     * the new Wikipedia component based on the last clicked link.
     */
    componentDidUpdate(prevProps) {
      if (this.props.location.search !== prevProps.location.search) {
        const searchParams = new URLSearchParams(this.props.location.search);
        const wikiValue = searchParams.get('wiki');

        if (wikiValue) {
          console.log('TODO:', wikiValue);
        }
      }
    }

    /**
     * Replace links to `/wiki/` page in in API response with
     * a URl search string instead. This allows us to update the
     * URL value without navigating away from the page.
     */
    replaceLinks(text) {
      if (!text) {
        return text;
      }

      // Add onto the existing URL search string
      const searchParams = new URLSearchParams(this.props.location.search);
      const wikiValue = searchParams.get('wiki');

      return text.replace(
        /\/wiki\//g,
        // Each page in the rabbit hole journey added to the links
        // on the page, separated by "|"s.
        // For example:
        //  1. /wiki/Pet_door  ->  /#/?wiki=Pet_door
        //  2. /wiki/Dog       ->  /#/?wiki=Pet_door|Dog
        //  3. /wiki/Mammal    ->  /#/?wiki=Pet_door|Dog|Mammal
        // TODO Handle if URL is too long, show message like
        // "you've been in the rabbit hole too long"
        `/#/?wiki=${wikiValue ? `${wikiValue}|` : ''}`
      );
    }

    render() {
      return (
        <div>
          {this.state.wikiData.lead &&
            this.state.wikiData.lead.sections &&
            this.state.wikiData.lead.sections.map((section) => (
              <div
                key={section.id}
                dangerouslySetInnerHTML={{
                  __html: this.replaceLinks(section.text),
                }}
              />
            ))}

          {this.state.wikiData.remaining &&
            this.state.wikiData.remaining.sections &&
            this.state.wikiData.remaining.sections.map((section) => (
              <div key={section.id}>
                <h2>{section.line}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: this.replaceLinks(section.text),
                  }}
                />
              </div>
            ))}
        </div>
      );
    }
  }
);
