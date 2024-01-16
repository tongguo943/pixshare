/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 *
 * @returns a Promise that should be filled with the response of the GET request
 * parsed as a JSON object and returned in the property named "data" of an
 * object. If the request has an error, the Promise should be rejected with an
 * object that contains the properties:
 * {number} status          The HTTP response status
 * {string} statusText      The statusText from the xhr request
 */
function fetchModel(url) {
  return new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onreadystatechange = function() {
      if(xhr.readyState === 4 && xhr.status === 200){
          let responseObject = JSON.parse(xhr.responseText);
          resolve({data : responseObject});
      }
      if (xhr.status !== 200) {
        let error = {status : xhr.status, statusText : xhr.statusText};
        reject(new Error(JSON.stringify(error)));
      }
    };
    xhr.send();
    
    // console.log(url);
    // setTimeout(() => reject(new Error(
    //   { status: 501, statusText: "Not Implemented" })), 
    //   0
    // );
    // On Success return:
    // resolve({data: getResponseObject});
  });
}

export default fetchModel;
