import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Tooltip,
  Avatar,
  IconButton,
  Stack,
} from "@mui/material";
import { HashRouter, Link } from "react-router-dom";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import LogoutIcon from "@mui/icons-material/Logout";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import MenuIcon from "@mui/icons-material/Menu";

import "./styles.css";
import axios from "axios";

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { userLoggedIn: {} };
  }

  componentDidMount() {
    let id = window.localStorage.getItem("idOfUserLoggedIn");
    axios
      .get("/user/" + id)
      .then((response) => {
        let user = response.data;
        this.setState({ userLoggedIn: user });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  handleAddPhoto = () => {
    this.props.onAddPhoto();
  };

  handleMenu = () => {
    this.props.onMenu();
  };

  handleLogout = (event) => {
    axios
      .post("/activity/logout", {
        user_id: this.state.userLoggedIn._id,
        date_time: new Date(),
      })
      .then(() => {
        console.log("New activity added.");
        axios
          .post("/admin/logout", {})
          .then(() => {
            // console.log(response);
            this.setState({ userLoggedIn: {} });
            window.localStorage.clear();
            window.location.reload();
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
    event.preventDefault();
  };

  render() {
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
    let color = generateColorFromUsername(
      this.state.userLoggedIn.first_name,
      this.state.userLoggedIn.last_name
    );

    return (
      <HashRouter>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar
            color="secondary"
            className="cs142-topbar-appBar"
            position="absolute"
          >
            <Toolbar>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ width: "100%" }}
              >
               
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="flex-start"
                  spacing={1}
                  sx={{
                    textDecoration: "none",
                    color: "white",
                  }}
                >
                  {/* Menu */}
                  {this.state.userLoggedIn._id ? (
                    <IconButton
                      size="large"
                      color="inherit"
                      edge="start"
                      aria-label="menu"
                      sx={{ display: { xs: "inline-block", lg: "none" } }}
                      onClick={(event) => this.handleMenu(event)}
                    >
                      <MenuIcon />
                    </IconButton>
                  ) : null}

                  {/* Logo */}
                  <img
                    src="../../logo.png"
                    alt="logo"
                    style={{ width: "50px" }}
                  />

                  <Typography
                    variant="h4"
                    noWrap
                    component="div"
                    sx={{
                      display: { xs: "none", md: "block" },
                      fontFamily: "cursive",
                    }}
                    className="logo-text"
                  >
                    PixShare
                  </Typography>
                </Stack>

                {/* Page Info */}
                {this.state.userLoggedIn._id ? (
                  <Typography
                    variant="h5"
                    noWrap
                    component="div"
                    sx={{
                      display: { xs: "none", md: "block" },
                    }}
                    fontFamily="monospace"
                  >
                    {this.props.currentInfo}
                  </Typography>
                ) : null}

                {this.state.userLoggedIn._id ? (
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="flex-end"
                    spacing={4}
                  >
                    {/* Button Group */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="flex-start"
                      spacing={1}
                    >
                      <Tooltip title="Create">
                        <IconButton
                          aria-label="create"
                          onClick={(event) => this.handleAddPhoto(event)}
                        >
                          <AddAPhotoIcon sx={{ color: "white" }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Recent activities">
                        <IconButton
                          aria-label="activities"
                          component={Link}
                          to={"/activities"}
                        >
                          <AccessTimeIcon sx={{ color: "white" }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Favorites">
                        <IconButton
                          aria-label="favorites"
                          component={Link}
                          to={"/favorites"}
                        >
                          <BookmarkIcon sx={{ color: "white" }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Sign out">
                        <IconButton
                          aria-label="logout"
                          onClick={(event) => this.handleLogout(event)}
                        >
                          <LogoutIcon sx={{ color: "white" }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    {/* User Profile */}
                    <Tooltip title="Edit profile">
                      <Avatar
                        sx={{ bgcolor: color, textDecoration: "none" }}
                        component={Link}
                        to={"/personal-info/" + this.state.userLoggedIn._id}
                      >
                        {this.state.userLoggedIn.first_name
                          .toUpperCase()
                          .charAt(0)}
                      </Avatar>
                    </Tooltip>
                  </Stack>
                ) : null}
              </Stack>
            </Toolbar>
          </AppBar>
        </Box>
      </HashRouter>
    );
  }
}

export default TopBar;
