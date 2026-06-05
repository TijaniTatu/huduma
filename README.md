
# HUDUMA: A Service Delivery Mobile Application
![NPM License](https://img.shields.io/npm/l/react?logo=react&labelColor=black&color=red&link=https%3A%2F%2Fgithub.com%2FTijaniTatu%2Fhuduma%2Fblob%2Fmain%2FLICENSE)
![NPM Version](https://img.shields.io/npm/v/react?logo=nodedotjs&labelColor=white&color=green)


## Description

Huduma is a centralized service provision mobile application that connects users with verified local service providers, such as electricians,maids and plumbers. Traditional methods of finding service providers often lack credibility and traceability, leading to issues like theft, poor service, and property damage. Huduma addresses these challenges by requiring service providers to submit credentials and proof of identity for verification, ensuring that users are matched with qualified and trustworthy professionals. Additionally, the app features a rating system where users can rate their experience, helping to maintain high standards of service quality. Designed with simplicity and ease of use in mind, Huduma aims to cater to the diverse needs of the local community, enhancing service delivery and reliability in the local service industry.

## Installation

### Dependencies and Libraries

* [Node.js](https://nodejs.org/en/download/package-manager/current)
* [React Native](https://reactnative.dev/)
* [React](https://react.dev/)

## Installation steps

1. **Clone the repository:**
   It can be cloned to any location of your choice preferably your Desktop
    ```bash
    git clone https://github.com/TijaniTatu/Huduma_app.git
    ```
    Then in the terminal change the directory
   ```bash
   cd Huduma_app
   ````

3. **Install dependencies:**
    For the mobile app:

    ```bash
    cd ServicesApplicationFrontend
    npx expo install
    npm i
    ```

    For the server:

    ```bash
    cd Server
    npm install
    ```
    Then create the environment file and add your Firebase Admin service-account
    JSON (never commit either of these):

    ```bash
    cp .env.example .env   # then edit values in .env
    # place your service-account JSON where GOOGLE_APPLICATION_CREDENTIALS points
    ```

    For the admin:

    ```bash
    cd AdminFrontend
    npm install
    ```

4. **Configure firebase:**
    * Create a firebase project through the console
    * Add the firebase config to the firebase.js file in the ServicesApplicationFrontend folder
  [Sample Firebase configuration found in project settings](https://github.com/TijaniTatu/huduma/assets/131201362/f1bdc2fc-8295-42d8-b246-025d85b87ccf)

## Usage Instructions

### How to Run the application

* For the mobile app:

    ```bash
    cd ServicesApplicationFrontend
    npm start
    ```

* For the server:

    ```bash
    cd Server
    npm start
    ```

* For the admin:

    ```bash
    cd AdminFrontend
    npm run dev
    ```

### Usage Examples

Finding a Worker:

* Open the mobile app and login.
* go to the job screen.
* Pick the type of worker you need (e.g., electrician).
* Browse through the list of available workers.
* Click on the worker you want to hire.

Managing Users (Admin Panel):

* Open the admin panel in your browser.
* Use the sidebar to navigate to the "Users" tab.
* Perform CRUD operations on user data.

### Input/Output

* Input: User details, job requests, worker profiles.
* Output: Matched workers, job confirmations, user management data

## Project Structure

```
huduma
|
├─ AdminFrontend
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
|  |
│  └─ src
│     ├─ App.js
│     ├─ App.jsx
│     ├─ components
│     ├─ index.js
│     └─ tabs
|
|
├─ Server
│  ├─ package-lock.json
│  ├─ package.json
│  └─ src
│     ├─ index.js
│     └─ manage_users.js
|
└─ ServicesApplicationFrontend
   ├─ .expo
   │  ├─ devices.json
   |
   ├─ Actions
   ├─ assets
   ├─ components
   ├─ firebaseConfig.js
   ├─ Index.js
   ├─ Navigation
   │  └─ AuthStack.js
   ├─ notifications
   │  └─ auth.js
   ├─ Screens
   │  ├─ CustomerScreens
   │  ├─ SettingScreens
   │  │  └─ Settings.js
   │  ├─ SplashScreen.js
   │  └─ WorkerScreens
   │     ├─ Activity.js
   ├─ Services
   │  ├─ authService.js
   │  └─ stateService.js
   └─ Store
      └─ index.js

```

### Key Files
* <mark>ServicesApplicationFrontend/Navigation/AuthStack.js</mark>:   Main entry point for the mobile application.
* <mark>admin/src/App.jsx</mark>: Main entry point for the admin panel.
* <mark>Server/src/index.js</mark>: Firebase cloud functions for backend logic.

## Known Issues

* Some UI components may not render correctly on older devices.<br>
* Firebase authentication may require additional configuration for certain providers.

## Acknowledgent

* [React Native Documentation](https://reactnative.dev/docs/getting-started)
* [Firebase Documentation](https://firebase.google.com/docs)
* [React Documentation](https://legacy.reactjs.org/docs/getting-started.html)
* [React Native Paper](https://reactnativepaper.com/)
* [React Expo Documentation](https://docs.expo.dev/)

## Contact Us

For questions or feedback, please open an issue on the GitHub repository or contact us at [stoniedev@gmail.com] or [riekotijani@gmail.com]




