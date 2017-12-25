import React from 'react';
import { Redirect } from 'react-router-dom';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import queryString from 'query-string';
import { GITHUB_CLIENT_ID, GRAPHCOOL_TOKEN_KEY } from '../constants';

class LoginPage extends React.Component {
  state = { loading: false, error: '' };

  componentDidMount() {
    const query = queryString.parse(this.props.location.search);

    if (query.code) {
      this.logInUser(query.code);
    }
  }

  logInUser = async githubCode => {
    try {
      this.setState({ loading: true });

      const { data } = await this.props.authenticateUser(githubCode);

      localStorage.setItem(GRAPHCOOL_TOKEN_KEY, data.authenticateUser.token);

      this.props.history.replace('/');
    } catch (error) {
      this.setState({ loading: false, error });
    }
  };

  goToGithubAuthPage = () => {
    window.location = this.getGithubAuthUrl();
  };

  getGithubAuthUrl = () => {
    // get current URL without query string
    // reference: https://stackoverflow.com/a/5817566
    const { protocol, host, pathname } = window.location;
    const callbackUrl = protocol + '//' + host + pathname;

    const query = queryString.stringify({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: callbackUrl,
    });

    return `https://github.com/login/oauth/authorize?${query}`;
  };

  render() {
    const { data } = this.props;
    const { loading, error } = this.state;

    if (data.loading) {
      return <div>Loading</div>;
    }

    return data.loggedInUser ? (
      <Redirect to="/" />
    ) : (
      <div>
        <h1>Log In</h1>

        {loading && <p>Loading</p>}
        {error && <p>Error</p>}

        <button onClick={this.goToGithubAuthPage} disabled={loading}>
          Log in with GitHub
        </button>
      </div>
    );
  }
}

const LOGGED_IN_USER = gql`
  query LoggedInUser {
    loggedInUser {
      id
    }
  }
`;

const AUTHENTICATE_USER = gql`
  mutation AuthenticateUser($githubCode: String!) {
    authenticateUser(githubCode: $githubCode) {
      token
    }
  }
`;

export default compose(
  graphql(LOGGED_IN_USER, {
    options: { fetchPolicy: 'network-only' },
  }),
  graphql(AUTHENTICATE_USER, {
    props: ({ mutate }) => ({
      authenticateUser: githubCode => mutate({ variables: { githubCode } }),
    }),
  }),
)(LoginPage);
