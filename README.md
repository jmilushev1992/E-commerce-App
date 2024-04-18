
## Book Store

Open source web app on how to sell books online.  

## What is this project?

The main technologies are: Next.js, React.js, Material-UI.
On the server, the main technologies are: Next.js, Node.js, Express.js, Mongoose.js, MongoDB database.

In addition to the above technologies, there are methods on integrating the web application with the following external API services:
- [Google OAuth API](https://developers.google.com/identity/protocols/oauth2)
- [Github API](https://docs.github.com/en/rest/guides/basics-of-authentication)
- [Stripe API](https://stripe.com/docs/keys)
- [AWS SES API](https://docs.aws.amazon.com/STS/latest/APIReference/API_GetAccessKeyInfo.html)
- [Mailchimp API](https://mailchimp.com/developer/marketing/api/root/)

Plus, there are many concepts such as `session` and `cookie`, headers, HTTP request-response, Express middleware, `Promise`, `async/await`, and more.


## Creating a Google OAuth Client

These are the walk-through steps to create a Google OAuth client for the application.

#### Prerequisites

Before you begin, make sure you have the following:

- A Google account
- Access to the [Google Cloud Console](https://console.cloud.google.com/)

1. **Sign in to Google Cloud Console:**

- Go to the [Google Cloud Console](https://console.cloud.google.com/).
- Sign in with your Google account or create one if you don't have it.

2. **Create a New Project:**

- Click on the project dropdown in the top navigation bar.
- Click on "New Project."
- Give your project a name and click "Create."

3. **Enable the Google+ API (if required):**

- If you plan to use Google+ Sign-In for authentication, enable the "Google+ API" for your project.
- In the Cloud Console, go to the API & Services > Library.
- Search for "Google+ API" and enable it.

4. **Create OAuth Client ID:**

- In the Cloud Console, navigate to the API & Services > Credentials page.
- Click on "Create Credentials" and then select "OAuth client ID."
- Select the application type, typically "Web application" for a website or web application.
- Fill out the necessary information, such as the name of the OAuth client and authorized redirect URIs (where Google should redirect the user after authentication). You can use `http://localhost` as a redirect URI for development.
- Click "Create" to generate your OAuth client credentials. It will provide you with a client ID and client secret.


## Creating a GitHub Client ID and Client Secret

To create a GitHub Client ID and Client Secret, follow these steps:

1. **Sign in to your GitHub Account:**
   If you don't have a GitHub account, [create one](https://github.com/join).

2. **Go to Developer Settings:**
   Click on your profile picture in the top right corner of GitHub and select "Settings." In the left sidebar, under "Developer settings," click on "OAuth Apps."

3. **Create a New OAuth App:**
   Click on the "Register a new application" button.

4. **Fill in the Application Details:**
   You'll be prompted to fill in details about your application:
   - **Application Name:** The name of your application.
   - **Homepage URL:** The URL to your application's website.
   - **Application Description:** A brief description of your application.
   - **Authorization callback URL:** This is the URL to which GitHub will redirect users after they authorize your application. For testing purposes, you can use `http://localhost` if you're developing locally.

5. **Generate Your Client ID and Client Secret:**
   After you've filled in the details, click the "Register application" button. GitHub will generate a Client ID and Client Secret for your application.


## Run locally

- Clone the project and run `yarn` to add packages.
- Before you start the app, create a `.env` file at the app's root. This file must have values for some env variables specified below.
  - To get `MONGO_URL_TEST`, I recommend a [free MongoDB at MongoDB Atlas](https://docs.mongodb.com/manual/tutorial/atlas-free-tier-setup/).
  - Get `GOOGLE_CLIENTID` and `GOOGLE_CLIENTSECRET` by following [official OAuth tutorial](https://developers.google.com/identity/sign-in/web/sign-in#before_you_begin).

    Important: For Google OAuth app, callback URL is: http://localhost:8000/oauth2callback <br/>
    Important: You have to enable Google+ API in your Google Cloud Platform account.

  - Specify your own secret key for Express session `SESSION_SECRET`: https://github.com/expressjs/session#secret


- To use all features and third-party integrations (such as Stripe, Google OAuth, Mailchimp), create a `.env` file and add values for all variables as shown below. These variables are also listed in [`.env.example`], which you can use as a template to create your own `.env` file.

 `.env` :
  ```
  # Used in server/server.js
  MONGO_URL=
  MONGO_URL_TEST=
  SESSION_SECRET=
  
  # Used in lib/getRootUrl.js
  NEXT_PUBLIC_URL_APP=
  NEXT_PUBLIC_PRODUCTION_URL_APP=heroku
  
  # Used in server/google.js
  GOOGLE_CLIENTID=
  GOOGLE_CLIENTSECRET=
  
  # Used in server/aws.js
  AWS_ACCESSKEYID=
  AWS_SECRETACCESSKEY=
  AWS_REGION=
  
  # Used in server/models/User.js
  EMAIL_ADDRESS_FROM=jmilushev@abv.bg(your own e-mail address)
  
  ----------
  # All environmental variables above this line are required for successful sign up
  
  # Used in server/github.js
  GITHUB_TEST_CLIENTID=
  GITHUB_LIVE_CLIENTID=
  GITHUB_TEST_SECRETKEY=
  GITHUB_LIVE_SECRETKEY=
  
  # Used in server/stripe.js
  NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLEKEY=
  NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLEKEY=
  STRIPE_TEST_SECRETKEY=
  STRIPE_LIVE_SECRETKEY=
  STRIPE_TEST_DEMO_BOOK_PRICE_ID=
  STRIPE_LIVE_DEMO_BOOK_PRICE_ID=
  STRIPE_TEST_SECOND_BOOK_PRICE_ID=
  STRIPE_LIVE_SECOND_BOOK_PRICE_ID=
  
  # Used in server/mailchimp.js
  MAILCHIMP_API_KEY=
  MAILCHIMP_REGION=
  MAILCHIMP_PURCHASED_LIST_ID=
  MAILCHIMP_SIGNEDUP_LIST_ID=
  
  # Used in pages/_document.js and pages/_app.js
  NEXT_PUBLIC_GA_MEASUREMENT_ID=
  COOKIE_DOMAIN=".yourownwebsite"
  
  ```


- Add your value (domain that you own) for `COOKIE_DOMAIN` and `NEXT_PUBLIC_PRODUCTION_URL_APP`.

- Start the app with `yarn dev`.
  - To get `NEXT_PUBLIC_GA_MEASUREMENT_ID`, set up Google Analytics and follow [these instructions](https://support.google.com/analytics/answer/1008080?hl=en) to find your tracking ID.
  - To get Stripe-related API keys, set up or log into your Stripe account and find your key [here](https://dashboard.stripe.com/account/apikeys).
- Env keys `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLEKEY`/`NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLEKEY` are universally available (client and server). Env keys inside `.env` file are used in server code only unless they have `NEXT_PUBLIC_` prepended to their name. In that case, they are universally available.
- To make user a book's owner, set `"isAdmin": true` on corresponding MongoDB document in your database (default value is `false` for any new user).

**Important: if you don't add values for environmental variables to `.env` file, corresponding functionality will not work. For example, login with Google account, purchasing book, getting repo information via GitHub API and other third-party API infrastructures.**


## Add a new book

- Create a new Github repo (public or private).
- In that repo, create an `introduction.md` file and write some content.
- At the top of your `introduction.md` file, add metadata in the format shown below.
  
  ```
  ---
  title: Introduction
  seoTitle: title for search engines
  seoDescription: description for search engines
  isFree: true
  ---
  ```

- Go to the app, click "Connect Github".
- Click "Add Book". Enter details and select the Github repo you created.
- Click "Save".

When you add new `.md` files or update content, go to the `BookDetail` page of your app and click `Sync with Github`. 

Important: All `.md` files in your Github repo _must_ have metadata in the format shown above.

Important: All `.md` files in your Github repo _must_ have name `introduction.md` or `chapter-N.md`.

To make the content of a `.md` file _private_ (meaning a person must purchase the content to see it), remove `isFree:true`  and add `excerpt:""`. Add some excerpt content - this content is public and serves as a free preview.


## Add your own styles

To change the color scheme of this app, modify the `primary` and `secondary` theme colors inside `lib/context.js`. Select any colors from Material UI's official [color palette](https://material-ui-next.com/style/color/#color).

Recommended ways to add your own styles to this app:
1. [Inline style for a single element](#inline-style-for-a-single-element)
2. [Reusable style for multiple elements within single page or component](#reusable-style-for-multiple-elements-within-single-page-or-component)
3. [Reusable/importable style for multiple pages or components](#reusableimportable-style-for-multiple-pages-or-components)
4. [Global style for all pages in application](#global-style-for-all-pages-in-application)


### Inline style for a single element

USE CASE: apply a style to _one element_ on a single page/component <br>
For example, in the `book` page, I wrote this single inline style:
```
<p style={{ textAlign: 'center' }}>
  ...
</p>
```


### Reusable style for multiple elements within single page or component

USE CASE: apply the same style to _multiple elements_ on a single page/component.<br>
For example, in my `tutorials` page, I created `styleExcerpt` and applied it to a `<p>` element within the page:

```
const styleExcerpt = {
  margin: '0px 20px',
  opacity: '0.75',
  fontSize: '13px',
};

<p style={styleExcerpt}>
  ...
</p>

```


### Reusable/importable style for multiple pages or components

USE CASE: apply the same style to elements on _multiple pages/components_.<br>
For example, I created `styleH1` inside `components/SharedStyles.js` and exported the style at the bottom of the file:
```
const styleH1 = {
  textAlign: 'center',
  fontWeight: '400',
  lineHeight: '45px',
};

module.exports = {
  styleH1,
};
```

I then imported `styleH1` into my `book` page, as well as my `index` page, and applied the style to a `<h1>` element:
```
import {
  styleH1,
} from '../components/SharedStyles';

<h1 style={styleH1}>
  ...
</h1>
```


### Global style for all pages in application

USE CASE: apply the same style to elements on _all pages_ of your app.<br>
Create your style in `pages/_document.js`. For example, I specified a style for all hyperlinks that use the `<a>` element:
```
<style>
  {`
    a, a:focus {
      font-weight: 400;
      color: #1565C0;
      text-decoration: none;
      outline: none
    }
  `}
</style>
```


## Deploy to Heroku

In this section, I deploy my app to [Heroku cloud](https://www.heroku.com/home). I will deploy our React-Next-Express app to lightweight Heroku container called [dyno](https://www.heroku.com/dynos).

Adjust route if you are deploying app from the root of this public repo.

I will discuss the following topics in this section:
1. installing Heroku on Linux-based OS
2. creating app on Heroku dashboard
3. preparing app for deployment
4. configuring env variables
5. deploying app
6. checking logs
7. adding custom domain


1. Install Heroku CLI (command-line interface) on your OS. Follow the [official guide](https://devcenter.heroku.com/articles/heroku-cli). In this book I provide instructions for Linux-based systems, in particular, a Ubuntu OS. For Ubuntu OS, run in your terminal:
  <pre>sudo snap install --classic heroku</pre>
  To confirm a successful installation, run:
  <pre>heroku --version</pre>
  As example, my output that confirms successful installation, looks like:
  <pre>heroku/7.22.7 linux-x64 node-v11.10.1</pre>

2. [Sign up](https://signup.heroku.com/) for Heroku, go to your Heroku dashboard and click purple <b>New</b> button on the right<br><br>
  
    On the next screen, give a name to your app and select a region. Click purple <b>Create app</b> button at the bottom<br><br>
    
    You will be redirected to `Deploy` tab of your newly created Heroku app<br><br>
  

3. As you can see from the above screenshot, you have two options. You can deploy the app directly from your local machine using Heroku CLI or directly from GitHub.
    
    Deploying from GitHub has a few advantages. Heroku uses git to track changes in a codebase. It's possible to deploy app from the local machine using Heroku CLI, however you have to create a [Git repo] with `package.json` file at the root level. A first advantage is that I can deploy from a non-root folder using GitHub instead of Heroku CLI.
    
    A second advantage is automation, later on you can create a branch that automatically deploy every new commit to Heroku. When we commit to `master` branch - there is no new deployment, when we commit to `deploy` branch - new change is automatically deployed to Heroku app.

    Let's set up deploying from GitHub. On `Deploy` tab of your Heroku app at Heroku dashboard, click <b>Connect to GitHub</b>, then search for your repo, then click <b>Connect</b> next to the name of the proper repo<br><br>

    If successful, you will see green text `Connected` and be offered to select a branch and deploy app automatically or manually. Automatic deployment will deploy every new commit, manual deployment requires you to manually click on <b>Deploy Branch</b> button. For simplicity, I will deploy manually from `master` branch of my repo.

    Before we perform a manual deployment via GitHub, I need Heroku to run some additional code while app is being deploying.  Heroku needs to know that my app is Node.js app so Heroku finds `package.json` file, properly installs dependencies and runs proper scripts (such as `build` and `start` scripts from `package.json`). To achieve this, we need to add so called `buildpacks` to our Heroku app. Click `Settings` tab, scroll to `Buildpacks` section and click purple <b>Add buildpack</b> button<br><br>
  
    Add two buildpacks, first is `https://github.com/timanovsky/subdir-heroku-buildpack` and second is `heroku/nodejs`<br><br>

    Next, scroll up while on `Settings` tab and click purple <b>Reveal Config Vars</b> button, create a new environmental variable `PROJECT_PATH` with value ${insert your value}<br><br>
  
    The above variable will be used by the first buildpack `subdir-heroku-buildpack` to deploy app from repo's subdirectory.

4. If we deploy app at this point, our app will deploy with errors since we did not add environmental variables. Similar to how you added `PROJECT_PATH` variable, add all environmental variables from your file to your Heroku app. Remember to add the rest of env variables for all features to work, including signup event.

5. While on `Settings` tab, scroll to `Domains and certificates` section and note your app's URL.
    Let's deploy, go to `Deploy` tab, scroll to `Manual deploy` section and click <b>Deploy branch</b> button.
    After deployment process is complete , navigate to your app's URL<br><br>
   

6. Server logs are not available on Heroku dashboard. To see logs, you have to use Heroku CLI.
    In your terminal, run:
    <pre>heroku login</pre>

    Follow instructions to log in to Heroku CLI.

    After successful login, terminal will print:
    <pre>Logged in as email@domain.com</pre>

    Where `email@domain.com` is an email address that you used to create your Heroku account.

    To see logs, in your terminal run:
    <pre>heroku logs --app ${your directory} --tail</pre>

    In your terminal, you will see your most recent logs and be able to see a real-time logs. 

    You can output certain number of lines (N) for retrieved logs by adding `--num N` to the `heroku logs` command.
    You can print only app's logs by adding `--source app` or system's logs by adding `--source heroku`.  

7. Time to add a custom domain. The Heroku app that we created is deployed on `free dyno`. Free dyno plan does not let you to add a custom domain to your app. To add custom domain, go to `Resources` tab and click purple <b>Change Dyno Type</b> button<br><br>
    
    Select a `Hobby` plan and click <b>Save</b> button.

    Navigate to `Settings` tab and scroll to the `Domains and certificates` and click purple <b>Add domain</b> button<br><br>
   
    Type your custom domain name `heroku.(your-app-name).org` as a custom domain, click <b>Save changes</b> button.

    Heroku will display you a value for CNAME record that you have to create for your custom domain. I manage DNS records at Now by Zeit.
    
    After you create a CNAME, ACM status on Heroku's dashboard will change to `Ok`<br><br>
   

It's important that you remember to manually add your custom domain to the settings of your Google OAuth app and GitHub OAuth app . If you forget to do it, you will see errors when you try to log in to your app or when you try to connect GitHub to your app.


## Scaling

You may want to consider splitting single Next/Express server into two servers:
- Next server for serving pages, server-side caching, sitemap and robots
- Express server for internal and external APIs


Splitting servers will get you:
- faster page loads since Next rendering does not block internal and external APIs,
- faster code reload times during development,
- faster deployment and more flexible scaling of individual apps.


#### Core stack

- [React](https://github.com/facebook/react)
- [Material-UI](https://github.com/mui-org/material-ui)
- [Next](https://github.com/zeit/next.js)
- [Express](https://github.com/expressjs/express)
- [Mongoose](https://github.com/Automattic/mongoose)
- [MongoDB](https://github.com/mongodb/mongo)

#### Third party APIs

- Google OAuth
- Github
- AWS SES
- Stripe
- MailChimp


## Project structure

```
.
├── .vscode
│   ├── extensions.json
│   ├── settings.json
├── book
├── builderbook
│   │   ├── config.yml
│   ├── components
│   │   ├── admin
│   │   │   ├── EditBook.jsx
│   │   ├── customer
│   │   │   ├── BuyButton.jsx
│   │   ├── Header.jsx
│   │   ├── MenuWithAvatar.jsx                   
│   │   ├── Notifier.jsx
│   │   ├── SharedStyles.js
├── lib
│   ├── api
│   │   ├── admin.js
│   │   ├── customer.js
│   │   ├── getRootURL.js
│   │   ├── public.js
│   │   ├── sendRequest.js
│   ├── notify.js
│   ├── theme.js
│   ├── withAuth.jsx
├── pages
│   ├── admin
│   │   ├── add-book.jsx
│   │   ├── book-detail.jsx
│   │   ├── edit-book.jsx
│   │   ├── index.jsx
│   ├── customer
│   │   ├── my-books.jsx
│   ├── public
│   │   ├── login.jsx
│   │   ├── read-chapter.jsx
│   ├── _app.jsx
│   ├── _document.jsx
│   ├── index.jsx
├── public
│   ├── robots.txt
├── server
│   ├── api
│   │   ├── admin.js
│   │   ├── customer.js
│   │   ├── index.js
│   │   ├── public.js
│   ├── models
│   │   ├── Book.js
│   │   ├── Chapter.js
│   │   ├── EmailTemplate.js
│   │   ├── Purchase.js
│   │   ├── User.js
│   ├── utils
│   │   ├──slugify.js
│   ├── app.js
│   ├── aws.js
│   ├── github.js
│   ├── google.js
│   ├── logger.js
│   ├── mailchimp.js
│   ├── routesWithSlug.js
│   ├── sitemapAndRobots.js
│   ├── stripe.js
├── test/server/utils
│   ├── slugify.test.js
├── .eslintrc.js
├── .gitignore
├── package.json
├── yarn.lock

```
