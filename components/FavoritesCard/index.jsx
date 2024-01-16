import React from "react";
import { HashRouter } from "react-router-dom";
import {
  Box,
  Button,
  Grid,
  List,
  ListItem,
  ListSubheader,
  Stack,
  Typography,
} from "@mui/material";
import PhotoIcon from "@mui/icons-material/Photo";

import "./styles.css";
import axios from "axios";

class FavoritesCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { favorites: {}, userLoggedIn: {} };
  }

  componentDidMount() {
    axios
      .get("/favorites")
      .then((response) => {
        let favorites = response.data;
        this.setState({ favorites: favorites });
      })
      .catch((err) => {
        console.log(err);
      });
    this.setState({
      userLoggedIn: {
        _id: window.localStorage.getItem("idOfUserLoggedIn"),
      },
    });
  }

  displayFavorites = () => {
    let favorites = this.state.favorites;
    let favoriteListItems = [];
    for (let i = 0; i < 4; i++) {
      if (favorites[i]) {
        favoriteListItems.push(
          <Grid item xs={6} key={"favorites-" + i}>
            <img
              className="favoritescard"
              src={"/../../images/" + favorites[i].file_name}
            />
          </Grid>
        );
      }
    }
    return favoriteListItems;
  };

  render() {
    return (
      <div>
        {this.state.userLoggedIn._id ? (
          <HashRouter>
            <List
              sx={{ width: "100%", bgcolor: "background.paper" }}
              subheader={(
                <ListSubheader>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ pt: 2 }}
                  >
                    <Typography
                      variant="subtitle2"
                      component="div"
                      sx={{ flexGrow: 1 }}
                    >
                      Favorites
                    </Typography>

                    <Button variant="text" size="small" href="#/favorites">
                      See all
                    </Button>
                  </Stack>
                </ListSubheader>
              )}
            >
              <ListItem key="favorites">
                <Box sx={{ width: "100%" }} >
                  {this.state.favorites.length ? (
                    <Grid container rowSpacing={1} columnSpacing={1} >
                      {this.displayFavorites()}
                    </Grid>
                  ) : (
                    <Stack
                      alignItems="center"
                      justifyContent="center"
                      spacing={2}
                    >
                      <PhotoIcon style={{ color: "grey" }} />
                      <Typography variant="subtitle2" style={{ color: "grey" }}>
                        No favorites yet
                      </Typography>
                    </Stack>
                  )}
                </Box>
              </ListItem>
            </List>
          </HashRouter>
        ) : null}
      </div>
    );
  }
}

export default FavoritesCard;
