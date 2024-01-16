import React from "react";
import { Link } from "react-router-dom";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
  Avatar,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Paper,
  IconButton,
  Hidden,
  Stack,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import "./styles.css";
import axios from "axios";

class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: {} };
  }

  componentDidMount() {
    let id = this.props.match.params.userId;
    axios
      .get("/user/" + id)
      .then((response) => {
        let user = response.data;
        this.setState({ user: user });
      })
      .catch((err) => {
        console.log(err);
      });
    this.handleUserDetailNewInfo();
  }

  componentDidUpdate(prevProps) {
    let id = this.props.match.params.userId;
    axios
      .get("/user/" + id)
      .then((response) => {
        let user = response.data;
        this.setState({ user: user });
      })
      .catch((err) => {
        console.log(err);
      });
    if (this.props.match.params.userId !== prevProps.match.params.userId) {
      this.handleUserDetailNewInfo();
    }
  }

  componentWillUnmount() {
    this.props.onUserDetailNewInfo("");
    this.setState = () => false;
  }

  handleUserDetailNewInfo = () => {
    let id = this.props.match.params.userId;
    axios
      .get("/user/" + id)
      .then((response) => {
        let user = response.data;
        this.props.onUserDetailNewInfo(
          user.first_name + " " + user.last_name + "'s info"
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  render() {
    let user = this.state.user;

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

    let color = generateColorFromUsername(user.first_name, user.last_name);

    return (
      <div className="user-detail-container">
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <Avatar
            sx={{
              bgcolor: color,
              width: 80,
              height: 80,
              fontSize: 40,
            }}
          >
            {user?.first_name?.toUpperCase().charAt(0)}
          </Avatar>
          <Typography
            variant="h5"
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user.first_name + " " + user.last_name}
          </Typography>
        </Stack>

        <Paper
          elevation={4}
          sx={{
            p: 2,
            margin: "auto",
            flexGrow: 1,
          }}
        >
          <List>
            <ListItem>
              <ListItemText
                primary={(
                  <Box>
                    <Hidden only={["xs", "sm"]}>
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        className="user-detail-heading"
                      >
                        Location
                      </Typography>
                    </Hidden>
                    <Typography variant="body1" className="user-detail-body">
                      <Hidden only={["md", "lg", "xl"]}>
                        <Typography variant="subtitle1" color="text.secondary">
                          Location
                        </Typography>
                      </Hidden>
                      {user.location}
                    </Typography>
                  </Box>
                )}
              />
            </ListItem>

            <Divider />

            <ListItem>
              <ListItemText
                primary={(
                  <Box>
                    <Hidden only={["xs", "sm"]}>
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        className="user-detail-heading"
                      >
                        Description
                      </Typography>
                    </Hidden>
                    <Typography variant="body1" className="user-detail-body">
                      <Hidden only={["md", "lg", "xl"]}>
                        <Typography variant="subtitle1" color="text.secondary">
                          Description
                        </Typography>
                      </Hidden>
                      {user.description}
                    </Typography>
                  </Box>
                )}
              />
            </ListItem>

            <Divider />

            <ListItem>
              <ListItemText
                primary={(
                  <Box>
                    <Hidden only={["xs", "sm"]}>
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        className="user-detail-heading"
                      >
                        Occupation
                      </Typography>
                    </Hidden>
                    <Typography variant="body1" className="user-detail-body">
                      <Hidden only={["md", "lg", "xl"]}>
                        <Typography variant="subtitle1" color="text.secondary">
                          Occupation
                        </Typography>
                      </Hidden>
                      {user.occupation}
                    </Typography>
                  </Box>
                )}
              />
            </ListItem>

            <Divider />

            <ListItemButton component={Link} to={"/photos/" + user._id}>
              <ListItemText
                primary="View All Posts"
                primaryTypographyProps={{
                  variant: "subtitle1",
                  color: "primary.main",
                  style: {
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                }}
              />
              <IconButton edge="end">
                <ArrowForwardIosIcon fontSize="small" color="primary" />
              </IconButton>
            </ListItemButton>
          </List>
        </Paper>

        <ImageList
          cols={window.matchMedia("(max-width: 900px)").matches ? 2 : 3}
          gap={8}
          rowHeight={200}
          sx={{ mt: 4 }}
        >
          {user.recent_photo_file_name ? (
            <ImageListItem
              key={user.recent_photo_date_time + user.recent_photo_file_name}
              component={Link}
              to={"/photos/" + user._id}
            >
              <img src={"/../../images/" + user.recent_photo_file_name} />
              <ImageListItemBar
                sx={{
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, " +
                    "rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
                }}
                position="top"
                actionPosition="left"
                title="Most Recent"
              />
              <ImageListItemBar
                subtitle={new Date(
                  user.recent_photo_date_time
                ).toLocaleString()}
              />
            </ImageListItem>
          ) : null}

          {user.most_commented_count > 0 ? (
            <ImageListItem
              key={user.most_commented_count + user.most_commented_file_name}
              component={Link}
              to={"/photos/" + user._id}
            >
              <img src={"/../../images/" + user.most_commented_file_name} />
              <ImageListItemBar
                sx={{
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, " +
                    "rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
                }}
                position="top"
                actionPosition="left"
                title="Most Commented"
              />
              <ImageListItemBar
                subtitle={user.most_commented_count + " Comments"}
              />
            </ImageListItem>
          ) : null}
        </ImageList>
      </div>
    );
  }
}

export default UserDetail;
