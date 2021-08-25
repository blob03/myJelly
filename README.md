<h1 align="center">MyJelly</h1>
<h2 align="center">Jellyfin Web client modified to better fit LG WebOS</h2>
<h2 align="center">+ some extra features.</h2>

Note: This is NOT the LG launcher but a modification of the official web client that is hosted on the server.

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

3. Run the web client with webpack for local development.

   ```sh
   npm start
   ```

4. Build the client with sourcemaps available.

   ```sh
   npm run build:development
   ```
