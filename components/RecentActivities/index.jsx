import React from "react";
import { Link } from "react-router-dom";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  Typography,
  Hidden,
  ListItemIcon,
  Paper,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PhotoIcon from "@mui/icons-material/Photo";
import CommentIcon from "@mui/icons-material/Comment";

import "./styles.css";
import axios from "axios";

class RecentActivities extends React.Component {
  constructor(props) {
    super(props);
    this.state = { activities: {} };
  }

  componentDidMount() {
    this.props.onRecentActivities("Recent activities");
    axios
      .get("/activities")
      .then((response) => {
        let activities = response.data;
        this.setState({ activities: activities });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  getActivityList() {
    let activities = this.state.activities;
    if (activities.length > 20) {
      activities = activities.slice(0, 20);
    }
    let activityListItems = [];

    for (let i = 0; i < activities.length; i++) {
      if (activities[i]) {
        activityListItems.push(
          <ListItem key={activities[i]._id} alignItems="center" sx={{ px: 2 }}>
            <ListItemIcon style={{ minWidth: "80px" }}>
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
              style={{ whiteSpace: "nowrap", overflow: "scroll" }}
              primary={(
                <React.Fragment>
                  <Typography
                    variant="subtitle1"
                    sx={{ display: "inline" }}
                    className="activity-user-name"
                    component={Link}
                    to={"/users/" + activities[i].user_id}
                  >
                    {activities[i].user_name}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ display: "inline" }}>
                    {" " + activities[i].activity_type}
                  </Typography>
                </React.Fragment>
              )}
              secondary={(
                <Typography
                  sx={{ display: "inline" }}
                  component="span"
                  variant="body2"
                  color="text.secondary"
                >
                  {new Date(activities[i].date_time).toLocaleString()}
                </Typography>
              )}
            />

            <Hidden only={["xs", "sm"]}>
              {activities[i].file_name ? (
                <a
                  href={"#/photos/" + activities[i].author_id}
                  className="activity-thumbnail"
                >
                  <img src={"/../../images/" + activities[i].file_name} />
                </a>
              ) : null}
            </Hidden>
          </ListItem>
        );

        activityListItems.push(<Divider key={"divider" + activities[i]._id} />);
      }
    }
    return activityListItems;
  }

  render() {
    return (
      <div className="recent-activities-container">
        <Button
          variant="text"
          size="large"
          endIcon={<RefreshIcon />}
          onClick={(event) => {
            event.preventDefault();
            axios
              .get("/activities")
              .then((response) => {
                let activities = response.data;
                this.setState({ activities: activities });
              })
              .catch((err) => {
                console.log(err);
              });
          }}
        >
          Refresh
        </Button>
        <Paper
          elevation={4}
          sx={{
            p: 2,
            margin: "auto",
            flexGrow: 1,
          }}
        >
          <List sx={{ width: "100%" }}>{this.getActivityList()}</List>
        </Paper>
      </div>
    );
  }
}

export default RecentActivities;
