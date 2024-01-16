import React from "react";
import ReactDOM from "react-dom";
import {
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Modal,
  Stack,
  createTheme,
  ThemeProvider,
  Drawer,
  Box,
} from "@mui/material";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import axios from "axios";
import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister";
import RecentActivities from "./components/RecentActivities";
import UserFavorites from "./components/UserFavorites";
import FavoritiesCard from "./components/FavoritesCard";
import ActivitiesCard from "./components/ActivitiesCard";
import PersonalInfo from "./components/PersonalInfo";

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentInfo: "",
      dialogIsOpen: false,
      drawerIsOpen: false,
      modalWindowIsOpen: false,
      favorite: {},
    };
  }

  setInfo = (newInfo) => {
    this.setState({ currentInfo: newInfo });
  };

  setAddPhoto = () => {
    this.setState({ dialogIsOpen: true });
  };

  handleDialogClose = () => {
    this.setState({ dialogIsOpen: false });
  };

  setDrawer = () => {
    this.setState({ drawerIsOpen: true });
  };

  handleDrawerClose = () => {
    this.setState({ drawerIsOpen: false });
  };

  setModalWindow = (favorite) => {
    this.setState({ modalWindowIsOpen: true, favorite: favorite });
  };

  handleModalWindowClose = () => {
    this.setState({ modalWindowIsOpen: false, favorite: {} });
  };

  handleUploadButtonClicked = (e) => {
    e.preventDefault();
    if (this.uploadInput.files.length > 0) {
      // Create a DOM form and add the file to it under the name uploadedphoto
      const domForm = new FormData();
      domForm.append("uploadedphoto", this.uploadInput.files[0]);
      axios
        .post("/photos/new", domForm)
        .then((res) => {
          // console.log(res);
          axios
            .post("/activity/upload", {
              user_id: res.data.user_id,
              date_time: res.data.date_time,
              photo_id: res.data._id,
              file_name: res.data.file_name,
            })
            .then(() => {
              // console.log("New activity added.");
            })
            .catch((err) => {
              console.log(err);
            });
          this.setState({ dialogIsOpen: false });
          let url = "#/photos/" + res.data.user_id;
          window.location.assign(url);
        })
        .catch((err) => console.log(`POST ERR: ${err}`));
    }
  };

  render() {
    const theme = createTheme({
      palette: {
        primary: {
          main: "#824fd8",
        },
        secondary: {
          main: "#3D3B40",
        },
      },
      typography: {
        button: {
          textTransform: "none",
        },
      },
    });

    let idOfUserLoggedIn = window.localStorage.getItem("idOfUserLoggedIn");

    return (
      <ThemeProvider theme={theme}>
        <HashRouter>
          <Grid container spacing={2} columns={15}>
            <Grid item xs={15} >
              <TopBar
                onMenu={this.setDrawer}
                onAddPhoto={this.setAddPhoto}
                currentInfo={this.state.currentInfo}
              />
            </Grid>

            <div className="photoshare-main-topbar-buffer" />

            <Grid
              item
              lg={3}
              display={{ xs: "none", lg: "block" }}
            >
              <Paper className="photoshare-left-grid-item">
                <UserList />
              </Paper>
            </Grid>

            <Grid item xs={15} lg={9}>
              <Paper
                className="photoshare-main-grid-item"
                sx={{
                  backgroundColor: "#f5f5f5",
                }}
              >
                <Switch>
                  <Route exact path="/">
                    {idOfUserLoggedIn ? (
                      <Redirect to={"/users/" + idOfUserLoggedIn} />
                    ) : (
                      <Redirect to="/login-register" />
                    )}
                  </Route>

                  {!idOfUserLoggedIn ? (
                    <Route
                      path="/login-register"
                      render={(props) => <LoginRegister {...props} />}
                    />
                  ) : (
                    <Redirect
                      path="/login-register"
                      to={"/users/" + idOfUserLoggedIn}
                    />
                  )}

                  {idOfUserLoggedIn ? (
                    <Route
                      path="/users/:userId"
                      render={(props) => (
                        <UserDetail
                          {...props}
                          onUserDetailNewInfo={this.setInfo}
                        />
                      )}
                    />
                  ) : (
                    <Redirect path="/users/:userId" to="/login-register" />
                  )}

                  {idOfUserLoggedIn ? (
                    <Route
                      path="/personal-info/:userId"
                      render={(props) => (
                        <PersonalInfo
                          {...props}
                          onPersonalNewInfo={this.setInfo}
                        />
                      )}
                    />
                  ) : (
                    <Redirect
                      path="/personal-info/:userId"
                      to="/login-register"
                    />
                  )}

                  {idOfUserLoggedIn ? (
                    <Route
                      path="/photos/:userId"
                      render={(props) => (
                        <UserPhotos
                          {...props}
                          onUserPhotosNewInfo={this.setInfo}
                        />
                      )}
                    />
                  ) : (
                    <Redirect path="/photos/:userId" to="/login-register" />
                  )}

                  {idOfUserLoggedIn ? (
                    <Route
                      path="/favorites"
                      render={(props) => (
                        <UserFavorites
                          {...props}
                          onFavorites={this.setInfo}
                          onModalWindow={this.setModalWindow}
                        />
                      )}
                    />
                  ) : (
                    <Redirect path="/favorites" to="/login-register" />
                  )}

                  {idOfUserLoggedIn ? (
                    <Route
                      path="/activities"
                      render={(props) => (
                        <RecentActivities
                          {...props}
                          onRecentActivities={this.setInfo}
                        />
                      )}
                    />
                  ) : (
                    <Redirect path="/activities" to="/login-register" />
                  )}

                </Switch>
              </Paper>
            </Grid>

            <Grid
              item
              lg={3}
              display={{ xs: "none", lg: "block" }}
            >
              <Paper className="photoshare-right-grid-item">
                <FavoritiesCard />
                <ActivitiesCard />
              </Paper>
            </Grid>
          </Grid>
        </HashRouter>

        <Dialog
          open={this.state.dialogIsOpen}
          onClose={() => this.handleDialogClose()}
        >
          <DialogTitle>Create new post</DialogTitle>
          <DialogContent>
            <input
              type="file"
              accept="image/*"
              ref={(domFileRef) => {
                this.uploadInput = domFileRef;
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.handleDialogClose()}>Cancel</Button>
            <Button onClick={(event) => this.handleUploadButtonClicked(event)}>
              Upload
            </Button>
          </DialogActions>
        </Dialog>

        <Drawer
          anchor="left"
          open={this.state.drawerIsOpen}
          onClose={() => this.handleDrawerClose()}
        >
          <Box sx={{ padding: "8px", width: 250 }}>
            <UserList />
          </Box>
        </Drawer>

        <Modal
          open={this.state.modalWindowIsOpen}
          onClose={() => this.handleModalWindowClose()}
        >
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              p: 2,
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 500,
              bgcolor: "background.paper",
              border: "2px solid #000",
              boxShadow: 24,
            }}
          >
            <img
              src={"/../../images/" + this.state.favorite.file_name}
              style={{ width: "400px", height: "300px", borderRadius: "5px" }}
            />

            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              marginTop={2}
            >
              <Button
                variant="outlined"
                onClick={() => this.handleModalWindowClose()}
              >
                Close
              </Button>
              <Button
                variant="contained"
                href={"#/photos/" + this.state.favorite.author_id}
                onClick={() => {
                  this.handleModalWindowClose();
                }}
              >
                Detail
              </Button>
            </Stack>
          </Stack>
        </Modal>
      </ThemeProvider>
    );
  }
}

ReactDOM.render(<PhotoShare />, document.getElementById("photoshareapp"));
