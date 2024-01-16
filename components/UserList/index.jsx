import React from "react";
import { HashRouter, Link } from "react-router-dom";
import {
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Avatar,
  ListSubheader,
} from "@mui/material";

import "./styles.css";
import axios from "axios";

class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { users: [], userLoggedIn: {} };
  }

  componentDidMount() {
    axios
      .get("/user/list")
      .then((response) => {
        let users = response.data;
        this.setState({ users: users });
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

  getUserList() {
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

    let users = this.state.users;
    let userListItems = [];

    if (users) {
      for (let i = 0; i < users.length; i++) {
        let suffix =
          String(users[i]._id) ===
          String(window.localStorage.getItem("idOfUserLoggedIn"))
            ? " (You)"
            : "";
        let color = generateColorFromUsername(
          users[i].first_name,
          users[i].last_name
        );

        userListItems.push(
          <ListItem sx={{ paddingLeft: 0, paddingRight: 0 }} key={users[i]._id}>
            <ListItemButton component={Link} to={"/users/" + users[i]._id}>
                <Avatar sx={{ bgcolor: color, marginRight: 2 }}>
                  {users[i].first_name.toUpperCase().charAt(0)}
                </Avatar>
              <ListItemText
                className="user-list-name"
                primary={
                  users[i].first_name + " " + users[i].last_name + suffix
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
            </ListItemButton>
          </ListItem>
        );

        userListItems.push(<Divider key={"devider" + users[i]._id} />);
      }
    }
    return userListItems;
  }

  render() {
    return (
      <div>
        {this.state.userLoggedIn._id ? (
          <HashRouter>
            <List
              component="nav"
              subheader={(
                <ListSubheader component="div" id="user-list-subheader">
                  All Users
                </ListSubheader>
              )}
            >
              {this.getUserList()}
            </List>
          </HashRouter>
        ) : null}
      </div>
    );
  }
}

export default UserList;
