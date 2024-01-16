import React from "react";
import {
  ImageList,
  ImageListItem,
  IconButton,
  ImageListItemBar,
  Box,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PhotoIcon from "@mui/icons-material/Photo";

import "./styles.css";
import axios from "axios";

class UserFavorites extends React.Component {
  constructor(props) {
    super(props);
    this.state = { favorites: {} };
  }

  componentDidMount() {
    axios
      .get("/favorites")
      .then((response) => {
        let favorites = response.data;
        this.setState({ favorites: favorites });
        this.props.onFavorites("Your favorites");
      })
      .catch((err) => {
        console.log(err);
      });
  }

  componentDidUpdate() {
    axios
      .get("/favorites")
      .then((response) => {
        let favorites = response.data;
        this.setState({ favorites: favorites });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  componentWillUnmount() {
    this.props.onFavorites("");
    this.setState = () => false;
  }

  displayFavorites = () => {
    let favorites = this.state.favorites;

    let favoriteListItems = [];
    for (let i = 0; i < favorites.length; i++) {
      if (favorites[i]) {
        favoriteListItems.push(
          <ImageListItem key={favorites[i].photo_id}>
            <img
              className="favorite-photos"
              src={"/../../images/" + favorites[i].file_name}
              onClick={() => this.props.onModalWindow(favorites[i])}
            />
            <ImageListItemBar
              sx={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, " +
                  "rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
              }}
              position="top"
              actionIcon={(
                <IconButton
                  sx={{ color: "white" }}
                  onClick={(event) => {
                    event.preventDefault();
                    axios
                      .post("/favorites", {
                        photo_id: favorites[i].photo_id,
                      })
                      .then(() => {
                        console.log("Photo unfavorited.");
                      })
                      .catch((err) => {
                        console.log(err);
                      });
                  }}
                >
                  <CloseIcon />
                </IconButton>
              )}
              actionPosition="left"
            />
          </ImageListItem>
        );
      }
    }
    return favoriteListItems;
  };

  render() {
    return (
      <div className="favorites-container">
        {this.state.favorites.length ? (
          <ImageList
            cols={window.matchMedia("(max-width: 900px)").matches ? 3 : 4}
            rowHeight={200}
            sx={{ mt: "40px" }}
          >
            {this.displayFavorites()}
          </ImageList>
        ) : (
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
              <PhotoIcon style={{ color: "grey", fontSize: "40px" }} />
              <Typography variant="h6" style={{ color: "grey" }}>
                No favorites yet
              </Typography>
            </Stack>
          </Box>
        )}
      </div>
    );
  }
}

export default UserFavorites;
