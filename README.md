<h2 align="center">That repository is no longer maintained</h2>
<h2 align="center">New home is located at https://bitbucket.org/myjelly/workspace/overview/</h2>
</br>
</br>

<h1 align="center">My Jelly</h1>
<h2 align="center">Jellyfin Web client modified to better fit LG WebOS</h2>
<h2 align="center">Includes bug fixes + some extra features.</h2>

Note: This is NOT the LG launcher but a modification of the official web client that is hosted on the server.

Homepage for Jellyfin server can be found here: https://github.com/jellyfin/jellyfin
<br>
Homepage for the official web client can be found here: https://github.com/jellyfin/jellyfin-web
<br>
Homepage for Jellyfin LG launcher can be found here: https://github.com/jellyfin/jellyfin-webos
<br>

UPDATE: Official launcher, for at least WebOS 6 and 5, can be installed directly from LG's content store.
From the TV's main menu, open the content store and from there, search the keyword "jellyfin" then install the
proposed application.
<br>
More information on how to install new applications on WebOS can be found here:
<br>
https://www.lg.com/us/support/help-library/installing-apps-from-the-lg-content-store-CT32003203-20152176397085

## Build Process

### Dependencies

- [Node.js](https://nodejs.org/en/download)
- npm (included in Node.js)

### Getting Started

1. Clone or download this repository.

   ```sh
   git clone https://github.com/blob03/myjelly.git
   cd myjelly
   ```

2. Install build dependencies in the project directory.

   ```sh
   npm install
   ```
   
3. (facultative) Run the web client with webpack for local development.

   ```sh
   npm start
   ```

4. Build the client with sourcemaps available.

   ```sh
   npm run build:development
   or
   npm run build:production
   ```
   
## Installation

5. Make a backup of the web client installed.

   ```sh
   sudo mv /usr/share/jellyfin/web /usr/share/jellyfin/web.bak
   ```
   
6. Overwrite it with the modified client.

   ```sh
   Please note that the "dist" directory is automatically created at step #4.
   sudo cp -rf dist /usr/share/jellyfin/web
   ```
   
7. Connect the Jellyfin server as usual.

