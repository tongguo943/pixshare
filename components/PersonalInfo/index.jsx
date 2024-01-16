import React from "react";
import {
  Typography,
  Box,
  Avatar,
  Paper,
  TextField,
  Button,
  Stack,
} from "@mui/material";

import "./styles.css";
import axios from "axios";

class PersonalInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      location: "",
      description: "",
      occupation: "",
    };
  }

  componentDidMount() {
    this.props.onPersonalNewInfo("Your profile info");
    let id = this.props.match.params.userId;
    axios
      .get("/personal-info/" + id)
      .then((response) => {
        let user = response.data;
        this.setState({
          user: user,
          location: user.location,
          description: user.description,
          occupation: user.occupation,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  componentDidUpdate() {
    let id = this.props.match.params.userId;
    axios
      .get("/personal-info/" + id)
      .then((response) => {
        let user = response.data;
        this.setState({
          user: user,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  componentWillUnmount() {
    this.props.onPersonalNewInfo("");
    this.setState = () => false;
  }

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
        <Stack
          alignItems="center"
          justifyContent="center"
          spacing={2}
          sx={{ mb: 4 }}
        >
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
              fontFamily: "monospace",
            }}
            fontWeight="medium"
          >
            {"Welcome, " + user.first_name}
          </Typography>
        </Stack>

        <Paper
          elevation={4}
          sx={{
            p: 4,
            margin: "auto",
            flexGrow: 1,
          }}
        >
          <Box component="form">
            <TextField
              multiline
              margin="dense"
              fullWidth
              id="info-location"
              label="Location"
              value={this.state.location}
              onChange={(event) => {
                this.setState({ location: event.target.value });
              }}
            />
            <TextField
              multiline
              margin="dense"
              fullWidth
              id="info-description"
              label="Description"
              value={this.state.description}
              onChange={(event) => {
                this.setState({ description: event.target.value });
              }}
            />
            <TextField
              multiline
              margin="dense"
              fullWidth
              id="info-occupation"
              label="Occupation"
              value={this.state.occupation}
              onChange={(event) => {
                this.setState({ occupation: event.target.value });
              }}
            />

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="flex-end"
              spacing={2}
              sx={{ width: "100%", mt: 2 }}
            >
              <Button
                variant="text"
                size="small"
                style={{ fontSize: "16px" }}
                onClick={() => this.setState({
                    location: user.location,
                    description: user.description,
                    occupation: user.occupation,
                  })}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                size="small"
                style={{ fontSize: "16px" }}
                disabled={
                  this.state.location === user.location &&
                  this.state.description === user.description &&
                  this.state.occupation === user.occupation
                }
                onClick={(event) => {
                  event.preventDefault();
                  axios
                    .post("/personal-info/" + user._id, {
                      location: this.state.location,
                      description: this.state.description,
                      occupation: this.state.occupation,
                    })
                    .then(() => {
                      // console.log("Profile updated.");
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                }}
              >
                Save
              </Button>
            </Stack>
          </Box>
        </Paper>
      </div>
    );
  }
}

export default PersonalInfo;
