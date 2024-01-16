import React from "react";
import { HashRouter, Link } from "react-router-dom";
import {
  Divider,
  List,
  ListItem,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Avatar,
  Grid,
  Hidden,
  Stack,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

import "./styles.css";
import axios from "axios";

class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = { photos: {}, newComment: "", user: {}, photoOwner: {} };
  }

  componentDidMount() {
    let id = this.props.match.params.userId;
    axios
      .get("/photosOfUser/" + id)
      .then((response) => {
        axios
          .get("/user/" + window.localStorage.getItem("idOfUserLoggedIn"))
          .then((response2) => {
            axios
              .get("/user/" + id)
              .then((response3) => {
                let photos = response.data;
                let user = response2.data;
                let photoOwner = response3.data;
                this.setState({
                  user: user,
                  photos: photos,
                  photoOwner: photoOwner,
                });
              })
              .catch((err3) => {
                console.log(err3);
              });
          })
          .catch((err2) => {
            console.log(err2);
          });
      })
      .catch((err) => {
        console.log(err);
      });
    this.handleUserPhotosNewInfo();
  }

  componentDidUpdate(prevProps) {
    let id = this.props.match.params.userId;
    axios
      .get("/photosOfUser/" + id)
      .then((response) => {
        axios
          .get("/user/" + window.localStorage.getItem("idOfUserLoggedIn"))
          .then((response2) => {
            axios
              .get("/user/" + id)
              .then((response3) => {
                let photos = response.data;
                let user = response2.data;
                let photoOwner = response3.data;
                this.setState({
                  user: user,
                  photos: photos,
                  photoOwner: photoOwner,
                });
              })
              .catch((err3) => {
                console.log(err3);
              });
          })
          .catch((err2) => {
            console.log(err2);
          });
      })
      .catch((err) => {
        console.log(err);
      });

    if (this.props.match.params.userId !== prevProps.match.params.userId) {
      this.handleUserPhotosNewInfo();
    }
  }

  componentWillUnmount() {
    this.props.onUserPhotosNewInfo("");
    this.setState = () => false;
  }

  handleUserPhotosNewInfo = () => {
    let id = this.props.match.params.userId;
    axios
      .get("/user/" + id)
      .then((response) => {
        let user = response.data;
        this.props.onUserPhotosNewInfo(
          user.first_name + " " + user.last_name + "'s posts"
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  displayUserPhotos = () => {
    let photos = this.state.photos;
    let user = this.state.user;
    let photoOwner = this.state.photoOwner;

    if (!photos.length) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{
            width: "100%",
            minHeight: "100%",
          }}
        >
          <Stack alignItems="center" justifyContent="center" spacing={2}>
            <PhotoCameraIcon style={{ color: "grey", fontSize: "40px" }} />
            <Typography variant="h6" style={{ color: "grey" }}>
              No posts yet
            </Typography>
          </Stack>
        </Box>
      );
    }

    function generateColorFromUsername(first_name, last_name) {
      let username = first_name + " " + last_name;
      let hash = 0;
      for (let i = 0; i < username.length; i++) {
        // eslint-disable-next-line no-bitwise
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
      }
      let h = hash % 360;
      let s = 30;
      let l = 50;
      return "hsl(" + h + ", " + s + "%, " + l + "%)";
    }

    let userColor = generateColorFromUsername(user.first_name, user.last_name);

    let photoOwnerColor = generateColorFromUsername(
      photoOwner.first_name,
      photoOwner.last_name
    );

    let photoItems = [];

    for (let i = 0; i < photos.length; i++) {
      if (photos) {
        let comments = photos[i].comments;
        let commentListItems = [];

        if (comments.length > 0) {
          for (let j = 0; j < comments.length; j++) {
            if (comments[j]) {
              let commentOwnerColor = generateColorFromUsername(
                comments[j].user.first_name,
                comments[j].user.last_name
              );

              commentListItems.push(
                <ListItem
                  key={comments[j]._id}
                  sx={{ flexGrow: 1, overflow: "hidden", mt: 2 }}
                >
                  <Stack spacing={2} sx={{ width: "100%" }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="flex-start"
                        spacing={2}
                      >
                        <Avatar
                          sx={{
                            bgcolor: commentOwnerColor,
                            textDecoration: "none",
                            width: 40,
                            height: 40,
                          }}
                          component={Link}
                          to={"/users/" + comments[j].user._id}
                        >
                          {comments[j]?.user?.first_name
                            ?.toUpperCase()
                            .charAt(0)}
                        </Avatar>

                        <Stack>
                          <Typography
                            variant="subtitle2"
                            component="div"
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {comments[j].user.first_name +
                              " " +
                              comments[j].user.last_name}
                          </Typography>

                          <Typography
                            variant="body2"
                            component="div"
                            color="text.secondary"
                            style={{
                              fontSize: 12,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {new Date(comments[j].date_time).toLocaleString()}
                          </Typography>
                        </Stack>
                      </Stack>

                      {user._id === comments[j].user._id ? (
                        <IconButton
                          aria-label="delete"
                          onClick={(event) => {
                            event.preventDefault();
                            axios
                              .post("/deleteComment/" + photos[i]._id, {
                                comment_id: comments[j]._id,
                              })
                              .then(() => {
                                // console.log("Comment deleted.");
                              })
                              .catch((err) => {
                                console.log(err);
                              });
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      ) : null}
                    </Stack>

                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="flex-start"
                      spacing={2}
                    >
                      <Avatar
                        sx={{
                          bgcolor: commentOwnerColor,
                          textDecoration: "none",
                          width: 40,
                          height: 0,
                        }}
                        component={Link}
                        to={"/users/" + comments[j].user._id}
                      >
                        {comments[j]?.user?.first_name?.toUpperCase().charAt(0)}
                      </Avatar>

                      <Typography variant="body1" component="div">
                        {comments[j].comment}
                      </Typography>
                    </Stack>
                  </Stack>
                </ListItem>
              );

              commentListItems.push(
                <Divider
                  key={"divider" + comments[j]._id}
                  variant="inset"
                  component="li"
                />
              );
            }
          }
        }

        commentListItems.push(
          <ListItem
            key={"new comment" + photos[i]._id}
            sx={{ flexGrow: 1, overflow: "hidden", mt: 2 }}
          >
            <Stack spacing={2} sx={{ width: "100%" }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="flex-start"
                spacing={2}
              >
                <Avatar
                  sx={{
                    bgcolor: userColor,
                    textDecoration: "none",
                    width: 40,
                    height: 40,
                  }}
                >
                  {user?.first_name?.toUpperCase().charAt(0)}
                </Avatar>
                <TextField
                  label="Write a comment..."
                  variant="standard"
                  margin="normal"
                  fullWidth
                  onChange={(event) => {
                    this.setState({ newComment: event.target.value });
                  }}
                  value={this.state.newComment}
                />
              </Stack>

              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  size="small"
                  style={{ fontSize: "16px" }}
                  disabled={this.state.newComment === ""}
                  onClick={(event) => {
                    event.preventDefault();
                    axios
                      .post("/commentsOfPhoto/" + photos[i]._id, {
                        comment: this.state.newComment,
                        date_time: new Date(),
                      })
                      .then((res) => {
                        this.setState({ newComment: "" });
                        // console.log("Comment added.");
                        axios
                          .post("/activity/comment", {
                            user_id: res.data.user_id,
                            date_time: res.data.comment_date_time,
                            photo_id: res.data.photo_id,
                            author_id: res.data.author_id,
                            file_name: res.data.file_name,
                            comment_id: res.data.comment_id,
                          })
                          .then(() => {
                            // console.log("New activity added.");
                          })
                          .catch((err) => {
                            console.log(err);
                          });
                      })
                      .catch((err) => {
                        console.log(err);
                      });
                  }}
                >
                  Post
                </Button>
              </Box>
            </Stack>
          </ListItem>
        );

        photoItems.push(
          <Paper
            elevation={4}
            sx={{
              p: 4,
              mb: 4,
              flexGrow: 1,
            }}
            key={"photo" + photos[i]._id}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Avatar
                sx={{
                  bgcolor: photoOwnerColor,
                  textDecoration: "none",
                  width: 50,
                  height: 50,
                  fontSize: 30,
                }}
                component={Link}
                to={"/users/" + photoOwner._id}
              >
                {photoOwner?.first_name?.toUpperCase().charAt(0)}
              </Avatar>
              <Stack>
                <Typography
                  variant="subtitle2"
                  component="div"
                  style={{ fontSize: 15 }}
                >
                  {photoOwner.first_name + " " + photoOwner.last_name}
                </Typography>
                <Typography
                  variant="body2"
                  component="div"
                  color="text.secondary"
                  style={{ fontSize: 13 }}
                >
                  {new Date(photos[i].date_time).toLocaleString()}
                </Typography>
              </Stack>
            </Stack>

            <img
              src={"/../../images/" + photos[i].file_name}
              className="user-photo"
            />

            <Grid container sx={{ borderBottom: 1, borderColor: "divider" }}>
              {/* Like */}
              <Grid item xs={4}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="flex-start"
                  spacing={1}
                >
                  {photos[i].likes.indexOf(user._id) < 0 ? (
                    <IconButton
                      onClick={(event) => {
                        event.preventDefault();
                        axios
                          .post("/likePhoto/" + photos[i]._id, {})
                          .then(() => {
                            // console.log("Photo liked.");
                          })
                          .catch((err) => {
                            console.log(err);
                          });
                      }}
                    >
                      <FavoriteBorderRoundedIcon sx={{ color: "black" }} />
                    </IconButton>
                  ) : (
                    <IconButton
                      onClick={(event) => {
                        event.preventDefault();
                        axios
                          .post("/likePhoto/" + photos[i]._id, {
                            date_time: new Date(),
                          })
                          .then(() => {
                            // console.log("Photo unliked.");
                          })
                          .catch((err) => {
                            console.log(err);
                          });
                      }}
                    >
                      <FavoriteRoundedIcon color="error" />
                    </IconButton>
                  )}

                  <Hidden only={["xs", "sm"]}>
                    <Typography>{photos[i].likes.length + " Like"}</Typography>
                  </Hidden>

                  <Hidden only={["md", "lg", "xl"]}>
                    <Typography>{photos[i].likes.length}</Typography>
                  </Hidden>
                </Stack>
              </Grid>

              {/* Comment */}
              <Grid
                item
                xs={4}
                sx={{ borderBottom: 2, borderColor: "primary.main" }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  spacing={1}
                >
                  <IconButton disabled>
                    <ChatBubbleOutlineIcon color="primary" />
                  </IconButton>

                  <Hidden only={["xs", "sm"]}>
                    <Typography color="primary.main">
                      {photos[i].comments.length + " Comment"}
                    </Typography>
                  </Hidden>

                  <Hidden only={["md", "lg", "xl"]}>
                    <Typography>{photos[i].comments.length}</Typography>
                  </Hidden>
                </Stack>
              </Grid>

              {/* Favorite */}
              <Grid item xs={4}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="flex-end"
                  spacing={1}
                >
                  {user.favorites.indexOf(photos[i]._id) < 0 ? (
                    <>
                      <IconButton
                        onClick={(event) => {
                          event.preventDefault();
                          axios
                            .post("/favorites", {
                              photo_id: photos[i]._id,
                            })
                            .then(() => {
                              // console.log("Photo favorited.");
                            })
                            .catch((err) => {
                              console.log(err);
                            });
                        }}
                      >
                        <BookmarkBorderIcon sx={{ color: "black" }} />
                      </IconButton>

                      <Hidden only={["xs", "sm"]}>
                        <Typography>Save</Typography>
                      </Hidden>
                    </>
                  ) : (
                    <>
                      <IconButton
                        onClick={(event) => {
                          event.preventDefault();
                          axios
                            .post("/favorites", {
                              photo_id: photos[i]._id,
                            })
                            .then(() => {
                              // console.log("Photo unfavorited.");
                            })
                            .catch((err) => {
                              console.log(err);
                            });
                        }}
                      >
                        <BookmarkIcon sx={{ color: "#f7cd03" }} />
                      </IconButton>

                      <Hidden only={["xs", "sm"]}>
                        <Typography>Saved</Typography>
                      </Hidden>
                    </>
                  )}
                </Stack>
              </Grid>
            </Grid>

            <List>{commentListItems}</List>
          </Paper>
        );
      }
    }

    return photoItems;
  };

  render() {
    return <HashRouter>{this.displayUserPhotos()}</HashRouter>;
  }
}

export default UserPhotos;
