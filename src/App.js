import React from 'react';
import { HashRouter as Router, Switch, Route, Link } from 'react-router-dom';

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
        <RabbitHole />
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

class RabbitHole extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wikiData: {},   
    }
  }

  componentDidMount() {
    fetch(`https://en.wikipedia.org/api/rest_v1/page/random/mobile-sections`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((resp) => resp.json())
      .then((resp) => {
        console.log('resp', resp);

        this.setState({ wikiData: resp });
      });
  }


  render() {
    return <div>
      {this.state.wikiData.lead &&
      this.state.wikiData.lead.sections &&
      this.state.wikiData.lead.sections.map((section) => (
        <div
          key={section.id}
          dangerouslySetInnerHTML={{ __html: section.text }}
        />
      ))}
      
      {this.state.wikiData.remaining &&
      this.state.wikiData.remaining.sections &&
      this.state.wikiData.remaining.sections.map((section) => (
        <div key={section.id}>
          <h2>{section.line}</h2>
          <div dangerouslySetInnerHTML={{ __html: section.text }}/>
        </div>
      ))}
  </div>
  }
}