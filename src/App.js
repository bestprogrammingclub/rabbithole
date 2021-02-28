import React from 'react';
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  withRouter,
} from 'react-router-dom';
import { Grommet } from 'grommet';

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
      <Grommet plain>
        <RabbitHolePage />
      </Grommet>
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
        firstPageTitle: '',
      };
    }

    componentDidMount() {
      console.log(this.props.location.search);
      if (this.props.location.search) {
        this.getMostRecentPage();
      } else {
        this.startNewRabbithole();
      }
    }

    /**
     * TODO Check for updates to the component so that we can detect
     * when there are changes to the URL. In our case, we want
     * to detect changes to the location search params and render
     * the new Wikipedia component based on the last clicked link.
     */
    componentDidUpdate(prevProps) {
      if (this.props.location.search !== prevProps.location.search) {
        this.getMostRecentPage();
      }
    }

    getMostRecentPage() {
      const searchParams = new URLSearchParams(this.props.location.search);
      const wikiValue = searchParams.get('wiki');

      if (wikiValue) {
        const wikiValueArray = wikiValue.split('|');
        const mostRecentPage = wikiValueArray[wikiValueArray.length - 1];

        this.fetchPage(mostRecentPage);
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
        `/#/?wiki=${
          wikiValue ? `${wikiValue}` : `${this.state.firstPageTitle}`
        }|`
      );
    }

    fetchPage(pageTitle) {
      fetch(
        `https://en.wikipedia.org/api/rest_v1/page/mobile-sections/${pageTitle}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
        .then((resp) => resp.json())
        .then((data) => {
          console.log('resp', data);

          this.setState({ wikiData: data });
        });
    }

    startNewRabbithole() {
      fetch(`https://en.wikipedia.org/api/rest_v1/page/random/title`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((resp) => resp.json())
        .then((randomTitleData) => {
          const randomPageTitle = randomTitleData.items[0].title;
          console.log('TITLE FETCH resp', randomPageTitle);
          this.setState({ firstPageTitle: randomPageTitle });

          this.fetchPage(randomPageTitle);
        });
    }

    render() {
      var rabbitHolePath = [];
      const searchParams = new URLSearchParams(this.props.location.search);
      const wikiValue = searchParams.get('wiki');

      if (wikiValue) {
        rabbitHolePath = wikiValue.replace(/_/g, ' ').split('|');
      }
      console.log(rabbitHolePath);

      return (
        <div>
          <a href="/#/" onClick={() => this.startNewRabbithole()}>
            START OVER
          </a>

          <ul>
            {rabbitHolePath.map((pageTitle, index) => (
              <li key={index}>{pageTitle}</li>
            ))}
          </ul>

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
