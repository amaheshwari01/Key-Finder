const { app, BrowserWindow,clipboard } = require('electron')

let authWindow;

function createAuthWindow() {

  authWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    'node-integration': false
  });
  
  let googleAuthURL = 'https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&redirect_uri=com.powerschool.portal%3A%2F%2F&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%20openid&response_type=code&client_id=162669419438-v9j0hrtnbkifi68ncq6jcr3ngadp2o0o.apps.googleusercontent.com';
  
  authWindow.loadURL(googleAuthURL);
  authWindow.show();

  authWindow.webContents.on('will-navigate', function (event, url) {
    handleCallback(url);
  });

  authWindow.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl) {
    handleCallback(newUrl);
  });
}

function handleCallback(url) {
 let raw_code = /code=([^&]*)/.exec(url) || null;
 let code = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
 let error = /\?error=(.+)$/.exec(url);

//  if (code || error) {
//    // Close the browser if code found or error
//    authWindow.destroy();
//  }

 if (code) {
   // This is where you should send the code to your server to exchange for a access token
     console.log('Code: ', code);
     const options = {
  method: 'POST',
  headers: {
    accept: '*/*',
    'content-type': 'application/x-www-form-urlencoded',
    'user-agent': 'PowerSchool/1 CFNetwork/1485 Darwin/23.1.0',
    'accept-language': 'en-US,en;q=0.9'
  },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    client_id: '162669419438-v9j0hrtnbkifi68ncq6jcr3ngadp2o0o.apps.googleusercontent.com',
    redirect_uri: 'com.powerschool.portal://'
  })
};
    let output=""
     fetch('https://oauth2.googleapis.com/token', options)
         .then(response => response.json())
         .then(response => {
          clipboard.writeText(JSON.stringify(response))
  
     
             // Create a new window to display the refresh token
             tokenWindow = new BrowserWindow({
                 width: 800,
                 height: 600,
                 show: false,
                 'node-integration': false
             });

             // Load the refresh token into the new window
 

             tokenWindow.loadURL(`data:text/html,
   <h1>Login tokens have been copied to clipboard</h1><p>here they are: <br> ${JSON.stringify(response)}</p>
   `);
             tokenWindow.show();
         }).catch(error => {
                console.log(error);
            });
 } else if (error) {
   alert('Oops! Something went wrong and we couldn\'t log you in using Google. Please try again.');
 }
}

app.whenReady().then(createAuthWindow)

app.on('window-all-closed', () => {
 if (process.platform !== 'darwin') {
   app.quit()
 }
})

app.on('activate', () => {
 if (BrowserWindow.getAllWindows().length === 0) {
   createAuthWindow()
 }
})