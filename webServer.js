/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the cs142 collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const async = require("async");

const express = require("express");
const app = express();

app.use(
  session({ secret: "secretKey", resave: false, saveUninitialized: false })
);
app.use(bodyParser.json());
const processFormBody = multer({ storage: multer.memoryStorage() }).single(
  "uploadedphoto"
);

const cs142password = require("./cs142password.js");

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");
const Activity = require("./schema/activity.js");

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/cs142project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 *
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    SchemaInfo.find({}, function (err, info) {
      if (err) {
        // Query returned an error. We pass it back to the browser with an
        // Internal Service Error (500) error code.
        console.error("Error in /user/info:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        // Query didn't return an error but didn't find the SchemaInfo object -
        // This is also an internal error return.
        response.status(500).send("Missing SchemaInfo");
        return;
      }

      // We got the object - return it in JSON format.
      console.log("SchemaInfo", info[0]);
      response.end(JSON.stringify(info[0]));
    });
  } else if (param === "counts") {
    // In order to return the counts of all the collections we need to do an
    // async call to each collections. That is tricky to do so we use the async
    // package do the work. We put the collections into array and use async.each
    // to do each .count() query.
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];
    async.each(
      collections,
      function (col, done_callback) {
        col.collection.countDocuments({}, function (err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function (err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          const obj = {};
          for (let i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    response.status(400).send("Bad param " + param);
  }
});

/**
 * Returns all the User objects.
 */
app.get("/user/list", function (request, response) {
  if (request.session.user_id) {
    User.find()
      .sort("first_name last_name")
      .exec((err, users) => {
        if (err) {
          console.error("Error in /user/list:", err);
          response.status(500).send(JSON.stringify(err));
          return;
        }
        if (users.length === 0) {
          response.status(500).send("Missing User");
          return;
        }
        let userList = [];
        for (let i = 0; i < users.length; i++) {
          let userListItem = {
            _id: users[i]._id,
            first_name: users[i].first_name,
            last_name: users[i].last_name,
          };
          userList.push(userListItem);
        }
        response.status(200).send(JSON.stringify(userList));
      });
  } else {
    response.status(401).send("Unauthorized.");
  }
});

/**
 * Returns the information for User (id).
 */

app.get("/user/:id", function (request, response) {
  if (request.session.user_id) {
    const id = request.params.id;
    User.findOne({ _id: id }, function (err, user) {
      if (err) {
        console.error("Error in /user/:id:", err);
        response.status(400).send(JSON.stringify(err));
        return;
      }
      if (user === null) {
        console.log("User with _id:" + id + " not found.");
        response.status(400).send("Not found");
        return;
      }
      Photo.find({ user_id: id })
        .sort({ date_time: -1 })
        .exec((err2, photos) => {
          if (err2) {
            console.error("Error in /user/:id:", err2);
            response.status(500).send(JSON.stringify(err2));
            return;
          }
          if (photos.length === 0) {
            response.status(200).send(
              JSON.stringify({
                _id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                location: user.location,
                description: user.description,
                occupation: user.occupation,
                recent_photo_file_name: "",
                recent_photo_date_time: null,
                most_commented_file_name: "",
                most_commented_count: 0,
                favorites: user.favorites,
              })
            );
            return;
          }
          let commentNum = {};
          let most_commented_file_name = "";
          let most_commented_count = 0;
          for (let i = 0; i < photos.length; i++) {
            for (let j = 0; j < photos[i].comments.length; j++) {
              let currentCommentNum = commentNum[photos[i]._id] || 0;
              commentNum[photos[i]._id] = currentCommentNum + 1;
            }
            if (commentNum[photos[i]._id] > most_commented_count) {
              most_commented_file_name = photos[i].file_name;
              most_commented_count = commentNum[photos[i]._id];
            }
          }
          response.status(200).send(
            JSON.stringify({
              _id: user._id,
              first_name: user.first_name,
              last_name: user.last_name,
              location: user.location,
              description: user.description,
              occupation: user.occupation,
              recent_photo_file_name: photos[0].file_name,
              recent_photo_date_time: photos[0].date_time,
              most_commented_file_name: most_commented_file_name,
              most_commented_count: most_commented_count,
              favorites: user.favorites,
            })
          );
        });
    });
  } else {
    response.status(401).send("Unauthorized.");
  }
});

/**
 * Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", function (request, response) {
  if (request.session.user_id) {
    const id = request.params.id;
    Photo.find({ user_id: id }).exec((err, photos) => {
      if (err) {
        console.error("Error in /photosOfUser/:id:", err);
        response.status(400).send(JSON.stringify(err));
        return;
      }
      if (photos.length === 0) {
        console.log("Photos for user with _id:" + id + " not found.");
        response.status(400).send("Not found");
        return;
      }

      photos.sort((a, b) => b.date_time - a.date_time);

      let photoList = [];
      for (let i = 0; i < photos.length; i++) {
        let comments = photos[i].comments;
        comments.sort(function (a, b) {
          let c = new Date(a.date_time);
          let d = new Date(b.date_time);
          return c - d;
        });

        let commentList = [];
        for (let j = 0; j < comments.length; j++) {
          let commentListItem = {
            comment: comments[j].comment,
            date_time: comments[j].date_time,
            _id: comments[j]._id,
            user: { _id: comments[j].user_id },
          };
          commentList.push(commentListItem);
        }

        let photoListItem = {
          _id: photos[i]._id,
          user_id: photos[i].user_id,
          comments: commentList,
          file_name: photos[i].file_name,
          date_time: photos[i].date_time,
          likes: photos[i].likes,
        };
        photoList.push(photoListItem);
      }

      const getCommentUser = function (comment, callback) {
        let user_id = comment.user._id;
        User.findOne({ _id: user_id }, function (err4, user) {
          if (err4) {
            console.log(err4);
          } else {
            comment.user.first_name = user.first_name;
            comment.user.last_name = user.last_name;
          }
          callback(err4);
        });
      };

      const getPhotoDetail = function (photo, callback) {
        async.each(photo.comments, getCommentUser, function (err3) {
          callback(err3);
        });
      };

      async.each(photoList, getPhotoDetail, function (err2) {
        if (err2) {
          console.log(err2);
          response.status(400).send(JSON.stringify(err2));
        } else {
          response.status(200).send(JSON.stringify(photoList));
        }
      });
    });
  } else {
    response.status(401).send("Unauthorized.");
  }
});

/**
 *  Allows a User to Log in.
 */
app.post("/admin/login", function (request, response) {
  let loginName = request.body.login_name;
  let password = request.body.password;
  User.findOne({ login_name: loginName }, function (err, user) {
    if (err) {
      console.error("Error in /admin/login:", err);
      response.status(400).send(JSON.stringify(err));
      return;
    }
    if (!user) {
      response.status(400).send(
        JSON.stringify({
          usernameMsg: "Username does not exist.",
        })
      );
      return;
    }
    if (
      !cs142password.doesPasswordMatch(
        user.password_digest,
        user.salt,
        password
      )
    ) {
      response.status(400).send(
        JSON.stringify({
          passwordMsg: "Incorrect password.",
        })
      );
      return;
    }
    request.session.user_id = user._id;
    response.status(200).send(
      JSON.stringify({
        _id: user._id,
      })
    );
  });
});

/**
 * A POST request with an empty body to this URL will logout the User.
 */
app.post("/admin/logout", function (request, response) {
  if (!request.session.user_id) {
    response.status(400).send("User is not logged in.");
    return;
  }
  request.session.destroy(function (err) {
    console.log(err);
  });
  response.status(200).send("Logout successful.");
});

/**
 *  Add a comment to the Photo (photo_id).
 */
app.post("/commentsOfPhoto/:photo_id", function (request, response) {
  if (!request.session.user_id) {
    response.status(401).send("Unauthorized.");
    return;
  }
  let photo_id = request.params.photo_id;
  let user_id = request.session.user_id;
  let comment = request.body.comment;
  let date_time = request.body.date_time;
  if (comment) {
    Photo.findOne({ _id: photo_id }, function (err, photo) {
      if (err) {
        console.error("Error in /commentsOfPhoto/:photo_id:", err);
        response.status(400).send(JSON.stringify(err));
        return;
      }
      let newComment = {
        comment: comment,
        user_id: user_id,
        date_time: date_time,
      };
      photo.comments = photo.comments.concat([newComment]);
      photo.save();
      response.status(200).send(
        JSON.stringify({
          photo_id: photo_id,
          author_id: photo.user_id,
          comment_date_time: date_time,
          user_id: user_id,
          file_name: photo.file_name,
          comment_id: photo.comments[photo.comments.length - 1]._id,
        })
      );
    });
  } else {
    response.status(400).send("Empty comment.");
  }
});

/**
 * Upload a Photo for the current User.
 */
app.post("/photos/new", function (request, response) {
  if (!request.session.user_id) {
    response.status(401).send("Unauthorized.");
    return;
  }
  processFormBody(request, response, function (err) {
    if (err || !request.file) {
      console.error("Error in /photos/new:", err);
      response.status(400).send(JSON.stringify(err));
      return;
    }

    const timestamp = new Date().valueOf();
    const filename = "U" + String(timestamp) + request.file.originalname;

    fs.writeFile("./images/" + filename, request.file.buffer, function (err2) {
      if (err2) {
        console.error("Error in photo uploading:", err2);
        response.status(400).send(JSON.stringify(err2));
        return;
      }
      let newPhoto = {
        file_name: filename,
        date_time: new Date(),
        user_id: request.session.user_id,
        comments: [],
      };
      Photo.create(newPhoto, function (err3, photo) {
        if (err3) {
          console.error("Error in photo creating:", err3);
          response.status(400).send(JSON.stringify(err3));
          return;
        }
        photo.save();
        response.status(200).send(JSON.stringify(photo));
      });
    });
  });
});

/**
 *  Allows a User to register.
 */
app.post("/user", function (request, response) {
  let loginName = request.body.login_name;
  let firstName = request.body.first_name;
  let lastName = request.body.last_name;
  let location = request.body.location;
  let description = request.body.description;
  let occupation = request.body.occupation;
  let password = cs142password.makePasswordEntry(request.body.password);

  User.findOne({ login_name: loginName }, function (err, user) {
    if (err) {
      console.error("Error in /user:", err);
      response.status(400).send(JSON.stringify(err));
      return;
    }
    if (user) {
      response.status(400).send(
        JSON.stringify({
          msg: "Username already exists.",
        })
      );
      return;
    }
    let newUser = {
      first_name: firstName,
      last_name: lastName,
      location: location,
      description: description,
      occupation: occupation,
      login_name: loginName,
      password_digest: password.hash,
      salt: password.salt,
    };

    User.create(newUser, function (err2, info) {
      if (err2) {
        console.error("Error in registration:", err2);
        response.status(400).send(JSON.stringify(err2));
        return;
      }
      response.status(200).send(
        JSON.stringify({
          _id: info._id,
          login_name: info.login_name,
        })
      );
    });
  });
});

/**
 *   Allows the User to like/unlike a Photo (photo_id).
 */
app.post("/likePhoto/:photo_id", function (request, response) {
  if (!request.session.user_id) {
    response.status(401).send("Unauthorized");
    return;
  }
  let photo_id = request.params.photo_id;
  let user_id = request.session.user_id;
  Photo.findOne({ _id: photo_id }, function (err, photo) {
    if (err) {
      response.status(400).send(JSON.stringify(err));
      return;
    }
    if (photo === null) {
      response.status(400).send("Photo not found.");
      return;
    }
    if (photo.likes.indexOf(user_id) < 0) {
      photo.likes.push(user_id);
    } else {
      photo.likes.remove(user_id);
    }
    photo.save();
    response.status(200).send();
  });
});

/**
 *  Add/delete a Photo to/from the the current User's favorites.
 */
app.post("/favorites", function (request, response) {
  if (!request.session.user_id) {
    response.status(401).send("Unauthorized");
    return;
  }
  let user_id = request.session.user_id;
  let photo_id = request.body.photo_id;
  User.findOne({ _id: user_id }, function (err, user) {
    if (err) {
      console.error("Error in /favorites:", err);
      response.status(400).send(JSON.stringify(err));
      return;
    }
    if (user.length === 0) {
      console.log("User not found.");
      response.status(400).send("Not found");
      return;
    }
    if (user.favorites.indexOf(photo_id) < 0) {
      user.favorites.push(photo_id);
    } else {
      user.favorites.remove(photo_id);
    }
    user.save();
    response.status(200).send();
  });
});

/**
 * Get favorites for the current User.
 */
app.get("/favorites", function (request, response) {
  if (!request.session.user_id) {
    response.status(401).send("Unauthorized");
    return;
  }
  let user_id = request.session.user_id;
  User.findOne({ _id: user_id }, function (err, user) {
    if (err) {
      console.error("Error in /favorites:", err);
      response.status(400).send(JSON.stringify(err));
      return;
    }
    if (user.length === 0) {
      console.log("User not found.");
      response.status(400).send("Not found");
      return;
    }
    let favoriteList = [];
    for (let i = 0; i < user.favorites.length; i++) {
      favoriteList.push({
        photo_id: user.favorites[i],
        author_id: null,
        file_name: "",
        date_time: null,
      });
    }

    function getFavoritePhotoDetail(favoritePhoto, callback) {
      let photo_id = favoritePhoto.photo_id;
      Photo.findOne({ _id: photo_id }, function (err3, photo) {
        if (err3) {
          console.log(err3);
        } else {
          favoritePhoto.author_id = photo.user_id;
          favoritePhoto.file_name = photo.file_name;
          favoritePhoto.date_time = photo.date_time;
        }
        callback(err3);
      });
    }

    async.each(favoriteList, getFavoritePhotoDetail, function (err2) {
      if (err2) {
        console.log(err2);
        response.status(400).send(JSON.stringify(err2));
      } else {
        response.status(200).send(JSON.stringify(favoriteList));
      }
    });
  });
});

/**
 *  Add a new Activity.
 */
app.post("/activity/:type", function (request, response) {
  if (request.params.type !== "register") {
    if (!request.session.user_id) {
      response.status(401).send("Unauthorized");
      return;
    }
  }
  const param = request.params.type;
  let user_id = request.body.user_id;

  User.findOne({ _id: user_id }, function (err, user) {
    if (err) {
      console.error("Error in /activity/login", err);
      response.status(400).send(JSON.stringify(err));
      return;
    }
    if (user === null) {
      console.log("User with _id:" + user_id + " not found.");
      response.status(400).send("Not found");
      return;
    }
    let newActivity = {};

    if (param === "login") {
      newActivity = {
        date_time: request.body.date_time,
        user_id: user_id,
        author_id: null,
        user_name: user.first_name + " " + user.last_name,
        activity_type: "logged in",
        photo_id: null,
        comment_id: null,
        file_name: "",
      };
      Activity.create(newActivity, function (err2, activity) {
        if (err2) {
          console.error("Error in /activity/login:", err2);
          response.status(400).send(JSON.stringify(err2));
          return;
        }
        activity.save();
        response.status(200).send();
      });
    } else if (param === "register") {
      newActivity = {
        date_time: request.body.date_time,
        user_id: user_id,
        author_id: null,
        user_name: user.first_name + " " + user.last_name,
        activity_type: "registered as a user",
        photo_id: null,
        comment_id: null,
        file_name: "",
      };
      Activity.create(newActivity, function (err3, activity) {
        if (err3) {
          console.error("Error in /activity/register:", err3);
          response.status(400).send(JSON.stringify(err3));
          return;
        }
        activity.save();
        response.status(200).send();
      });
    } else if (param === "logout") {
      newActivity = {
        date_time: request.body.date_time,
        user_id: user_id,
        author_id: null,
        user_name: user.first_name + " " + user.last_name,
        activity_type: "logged out",
        photo_id: null,
        comment_id: null,
        file_name: "",
      };
      Activity.create(newActivity, function (err4, activity) {
        if (err4) {
          console.error("Error in /activity/logout:", err4);
          response.status(400).send(JSON.stringify(err4));
          return;
        }
        activity.save();
        response.status(200).send();
      });
    } else if (param === "upload") {
      newActivity = {
        date_time: request.body.date_time,
        user_id: user_id,
        author_id: user_id,
        user_name: user.first_name + " " + user.last_name,
        activity_type: "posted a photo",
        photo_id: request.body.photo_id,
        comment_id: null,
        file_name: request.body.file_name,
      };
      Activity.create(newActivity, function (err5, activity) {
        if (err5) {
          console.error("Error in /activity/upload:", err5);
          response.status(400).send(JSON.stringify(err5));
          return;
        }
        activity.save();
        response.status(200).send();
      });
    } else if (param === "comment") {
      let author_id = request.body.author_id;
      User.findOne({ _id: author_id }, function (err6, author) {
        if (err6) {
          console.error("Error in /activity/comment", err6);
          response.status(400).send(JSON.stringify(err6));
          return;
        }
        if (author === null) {
          console.log("Author with _id:" + author_id + " not found.");
          response.status(400).send("Not found");
          return;
        }
        newActivity = {
          date_time: request.body.date_time,
          user_id: user_id,
          author_id: author._id,
          user_name: user.first_name + " " + user.last_name,
          activity_type: "added a comment",
          photo_id: request.body.photo_id,
          comment_id: request.body.comment_id,
          file_name: request.body.file_name,
        };
        Activity.create(newActivity, function (err7, activity) {
          if (err7) {
            console.error("Error in /activity/comment:", err7);
            response.status(400).send(JSON.stringify(err7));
            return;
          }
          activity.save();
          response.status(200).send();
        });
      });
    }
  });
});

/**
 * Get recent Activities.
 */
app.get("/activities", function (request, response) {
  if (!request.session.user_id) {
    response.status(401).send("Unauthorized");
    return;
  }
  Activity.find().exec((err, activities) => {
    if (err) {
      console.error("Error in /activities:", err);
      response.status(500).send(JSON.stringify(err));
      return;
    }
    if (activities.length === 0) {
      response.status(500).send("Missing Activity");
      return;
    }
    activities.sort(function (a, b) {
      if (a.date_time > b.date_time) {
        return -1;
      } else if (a.date_time < b.date_time) {
        return 1;
      } else {
        return 0;
      }
    });

    let activityList = [];
    for (let i = 0; i < activities.length; i++) {
      let activityListItem = {
        _id: activities[i]._id,
        date_time: activities[i].date_time,
        user_id: activities[i].user_id,
        author_id: activities[i].author_id,
        user_name: activities[i].user_name,
        activity_type: activities[i].activity_type,
        photo_id: activities[i].photo_id,
        file_name: activities[i].file_name,
      };
      activityList.push(activityListItem);
    }
    response.status(200).send(JSON.stringify(activityList));
  });
});

/**
 *  Delete a comment of the Photo (photo_id).
 */
app.post("/deleteComment/:photo_id", function (request, response) {
  if (!request.session.user_id) {
    response.status(401).send("Unauthorized.");
    return;
  }
  let photo_id = request.params.photo_id;
  let comment_id = request.body.comment_id;

  Photo.findOne({ _id: photo_id }, function (err, photo) {
    if (err) {
      response.status(400).send(JSON.stringify(err));
      return;
    }
    if (photo === null) {
      response.status(400).send("Photo not found.");
      return;
    }
    for (let i = 0; i < photo.comments.length; i++) {
      if (
        String(photo.comments[i]._id) === String(comment_id) &&
        String(photo.comments[i].user_id) === String(request.session.user_id)
      ) {
        Activity.remove(
          {
            user_id: request.session.user_id,
            activity_type: "added a comment",
            comment_id: comment_id,
          },
          function (err2) {
            if (err2) {
              response.status(400).send(JSON.stringify(err2));
              return;
            }
            photo.comments[i].remove();
            photo.save();
            response.status(200).send(JSON.stringify(photo));
          }
        );
      }
    }
  });
});

/**
 *  Returns personal info.
 */
app.get("/personal-info/:id", function (request, response) {
  if (
    request.session.user_id &&
    request.session.user_id === request.params.id
  ) {
    const id = request.session.user_id;
    User.findOne({ _id: id }, function (err, user) {
      if (err) {
        console.error("Error in /user/:id:", err);
        response.status(400).send(JSON.stringify(err));
        return;
      }
      if (user === null) {
        console.log("User with _id:" + id + " not found.");
        response.status(400).send("Not found");
        return;
      }
      response.status(200).send(
        JSON.stringify({
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          location: user.location,
          description: user.description,
          occupation: user.occupation,
        })
      );
    });
  } else {
    response.status(401).send("Unauthorized.");
  }
});

/**
 *  Allows the User to update profile info.
 */
app.post("/personal-info/:id", function (request, response) {
  if (
    request.session.user_id &&
    request.session.user_id === request.params.id
  ) {
    const id = request.session.user_id;
    let location = request.body.location;
    let description = request.body.description;
    let occupation = request.body.occupation;

    User.findOne({ _id: id }, function (err, user) {
      if (err) {
        console.error("Error in /user/:id:", err);
        response.status(400).send(JSON.stringify(err));
        return;
      }
      if (user === null) {
        console.log("User with _id:" + id + " not found.");
        response.status(400).send("Not found");
        return;
      }
      user.location = location;
      user.description = description;
      user.occupation = occupation;
      
      user.save();
      response.status(200).send();
    });
  } else {
    response.status(401).send("Unauthorized.");
  }
});

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
