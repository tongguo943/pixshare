import React from "react";
import { HashRouter } from "react-router-dom";
import {
  List,
  ListItem,
  ListSubheader,
  Typography,
  Divider,
  ListItemText,
  ListItemIcon,
  Button,
  Stack,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PhotoIcon from "@mui/icons-material/Photo";
import CommentIcon from "@mui/icons-material/Comment";

import "./styles.css";
import axios from "axios";

class ActivitiesCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { activities: {}, userLoggedIn: {} };
  }

  componentDidMount() {
    axios
      .get("/activities")
      .then((response) => {
        let activities = response.data;
        this.setState({ activities: activities });
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

  getActivityList() {
    let activities = this.state.activities;
    if (activities.length > 10) {
      activities = activities.slice(0, 10);
    }
    let activityListItems = [];
    for (let i = 0; i < activities.length; i++) {
      if (activities[i]) {
        activityListItems.push(
          <ListItem key={activities[i]._id}>
            <ListItemIcon style={{ minWidth: "40px" }}>
              {activities[i].activity_type === "logged in" ? (
                <LoginIcon style={{ color: "#4285F4" }} />
              ) : null}
              {activities[i].activity_type === "registered as a user" ? (
                <PersonAddIcon style={{ color: "#29ADB2" }} />
              ) : null}
              {activities[i].activity_type === "logged out" ? (
                <LogoutIcon style={{ color: "#9e9e9e" }} />
              ) : null}
              {activities[i].activity_type === "posted a photo" ? (
                <PhotoIcon style={{ color: "E26EE5" }} />
              ) : null}
              {activities[i].activity_type === "added a comment" ? (
                <CommentIcon style={{ color: "#824fd8" }} />
              ) : null}
            </ListItemIcon>
            <ListItemText
              primary={
                activities[i].user_name + " " + activities[i].activity_type
              }
              primaryTypographyProps={{
                variant: "subtitle2",
                style: {
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
            />
          </ListItem>
        );
        activityListItems.push(<Divider key={"divider" + activities[i]._id} />);
      }
    }
    return activityListItems;
  }

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
                      Recent Activities
                    </Typography>

                    <Button variant="text" size="small" href="#/activities">
                      See all
                    </Button>
                  </Stack>
                </ListSubheader>
              )}
            >
              {this.getActivityList()}
            </List>
          </HashRouter>
        ) : null}
      </div>
    );
  }
}

export default ActivitiesCard;
