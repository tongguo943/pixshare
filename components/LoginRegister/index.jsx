import React from "react";

import { Box, Typography, TextField, Button, Stack } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";

import "./styles.css";
import axios from "axios";

class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      registrationHeading: "",
      login: true,
      login_loginName: "",
      login_password: "",
      register_loginName: "",
      register_password: "",
      firstName: "",
      lastName: "",
      location: "",
      description: "",
      occupation: "",
      confirmPassword: "",
      login_loginNameMsg: "",
      login_loginNameError: false,
      register_loginNameMsg: "",
      register_loginNameError: false,
      firstNameMsg: "",
      firstNameError: false,
      lastNameMsg: "",
      lastNameError: false,
      login_passwordMsg: "",
      login_passwordError: false,
      register_passwordMsg: "",
      register_passwordError: false,
      confirmPasswordMsg: "",
      confirmPasswordError: false,
    };
  }

  componentDidMount() {
    this.setState({ registrationHeading: "Create your account" });
  }

  handleLogin(event) {
    event.preventDefault();

    if (this.state.login_loginName.length === 0) {
      this.setState({
        login_loginNameError: true,
        login_loginNameMsg: "Please fill out this field.",
      });
      return;
    }
    if (this.state.login_password.length === 0) {
      this.setState({
        login_passwordError: true,
        login_passwordMsg: "Please fill out this field.",
      });
      return;
    }

    axios
      .post("/admin/login", {
        login_name: this.state.login_loginName,
        password: this.state.login_password,
      })
      .then((response) => {
        axios
          .post("/activity/login", {
            user_id: response.data._id,
            date_time: new Date(),
          })
          .then(() => {
            // console.log("New activity added.");
          })
          .catch((err) => {
            console.log(err);
          });
        // console.log("Login successful.");
        window.localStorage.setItem("idOfUserLoggedIn", response.data._id);
        window.location.reload();
      })
      .catch((err) => {
        console.log(err);
        if (err.response.data.usernameMsg) {
          this.setState({
            login_loginNameError: true,
            login_loginNameMsg: err.response.data.usernameMsg,
          });
        }
        if (err.response.data.passwordMsg) {
          this.setState({
            login_passwordError: true,
            login_passwordMsg: err.response.data.passwordMsg,
          });
        }
      });
  }

  handleRegistration(event) {
    event.preventDefault();
    let newUser = {
      login_name: this.state.register_loginName,
      first_name: this.state.firstName,
      last_name: this.state.lastName,
      location: this.state.location,
      description: this.state.description,
      occupation: this.state.occupation,
      password: this.state.register_password,
      confirmPassword: this.state.confirmPassword,
    };

    if (newUser.login_name.length === 0) {
      this.setState({
        register_loginNameError: true,
        register_loginNameMsg: "Username cannot be empty.",
      });
      return;
    }

    if (newUser.first_name.length === 0) {
      this.setState({
        firstNameError: true,
        firstNameMsg: "First name cannot be empty.",
      });
      return;
    }

    if (newUser.last_name.length === 0) {
      this.setState({
        lastNameError: true,
        lastNameMsg: "Last name cannot be empty.",
      });
      return;
    }

    if (newUser.password.length === 0) {
      this.setState({
        register_passwordError: true,
        register_passwordMsg: "Password cannot be empty.",
      });
      return;
    }

    if (
      newUser.confirmPassword.length === 0 ||
      newUser.confirmPassword !== newUser.password
    ) {
      this.setState({
        confirmPasswordError: true,
        confirmPasswordMsg: "Please confirm your password before continuing.",
      });
      return;
    }

    axios
      .post("/user", newUser)
      .then((response) => {
        axios
          .post("/activity/register", {
            user_id: response.data._id,
            date_time: new Date(),
          })
          .then(() => {
            // console.log("New activity added.");
          })
          .catch((err) => {
            console.log(err);
          });
        this.setState({
          registrationHeading: "Registration successful!",
          register_loginName: "",
          register_password: "",
          firstName: "",
          lastName: "",
          location: "",
          description: "",
          occupation: "",
          confirmPassword: "",
        });
      })
      .catch((err) => {
        console.log(err);
        if (err.response.data.msg) {
          this.setState({
            register_loginNameError: true,
            register_loginNameMsg: err.response.data.msg,
          });
        }
      });
  }

  loginForm = () => {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={2}
        sx={{ width: "50%", minWidth: "200px" }}
      >
        <LockIcon color="primary" />
        <Typography
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          variant="h5"
          fontWeight="medium"
        >
          Welcome back
        </Typography>

        <Box component="form" sx={{ mt: 2 }}>
          <TextField
            margin="dense"
            required
            fullWidth
            autoFocus
            id="login-username"
            label="Username"
            value={this.state.login_loginName}
            error={this.state.login_loginNameError}
            helperText={this.state.login_loginNameMsg}
            onChange={(event) => {
              this.setState({
                login_loginName: event.target.value,
                login_loginNameError: false,
                login_loginNameMsg: "",
              });
            }}
          />
          <TextField
            margin="dense"
            required
            fullWidth
            id="login-password"
            label="Password"
            type="password"
            value={this.state.login_password}
            error={this.state.login_passwordError}
            helperText={this.state.login_passwordMsg}
            onChange={(event) => {
              this.setState({
                login_password: event.target.value,
                login_passwordError: false,
                login_passwordMsg: "",
              });
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, fontSize: "18px" }}
            onClick={(event) => this.handleLogin(event)}
          >
            Log in
          </Button>
        </Box>

        <Stack
          direction={{ sm: "column", md: "row" }}
          alignItems="center"
          justifyContent="center"
          spacing={1}
        >
          <Typography
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {"Don't have an account?"}
          </Typography>
          <Typography
            color="primary"
            onClick={() => this.setState({ login: !this.state.login })}
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              cursor: "pointer",
            }}
          >
            Sign Up
          </Typography>
        </Stack>
      </Stack>
    );
  };

  registrationForm = () => {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={2}
        sx={{ width: "50%", minWidth: "200px" }}
      >
        <LockIcon color="primary" />
        <Typography
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          variant="h5"
          fontWeight="medium"
        >
          {this.state.registrationHeading}
        </Typography>

        <Box component="form" sx={{ mt: 2 }}>
          <TextField
            margin="dense"
            required
            fullWidth
            id="register-username"
            label="Username"
            value={this.state.register_loginName}
            error={this.state.register_loginNameError}
            helperText={this.state.register_loginNameMsg}
            onChange={(event) => {
              this.setState({
                register_loginName: event.target.value,
                register_loginNameError: false,
                register_loginNameMsg: "",
              });
            }}
          />
          <TextField
            margin="dense"
            required
            fullWidth
            id="firstname"
            label="First Name"
            value={this.state.firstName}
            error={this.state.firstNameError}
            helperText={this.state.firstNameMsg}
            onChange={(event) => {
              this.setState({
                firstName: event.target.value,
                firstNameError: false,
                firstNameMsg: "",
              });
            }}
          />
          <TextField
            margin="dense"
            required
            fullWidth
            id="lastname"
            label="Last Name"
            value={this.state.lastName}
            error={this.state.lastNameError}
            helperText={this.state.lastNameMsg}
            onChange={(event) => {
              this.setState({
                lastName: event.target.value,
                lastNameError: false,
                lastNameMsg: "",
              });
            }}
          />
          <TextField
            margin="dense"
            fullWidth
            id="location"
            label="Location"
            value={this.state.location}
            onChange={(event) => {
              this.setState({ location: event.target.value });
            }}
          />
          <TextField
            margin="dense"
            fullWidth
            id="description"
            label="Description"
            value={this.state.description}
            onChange={(event) => {
              this.setState({ description: event.target.value });
            }}
          />
          <TextField
            margin="dense"
            fullWidth
            id="occupation"
            label="Occupation"
            value={this.state.occupation}
            onChange={(event) => {
              this.setState({ occupation: event.target.value });
            }}
          />
          <TextField
            margin="dense"
            required
            fullWidth
            id="register-password"
            label="Password"
            type="password"
            value={this.state.register_password}
            error={this.state.register_passwordError}
            helperText={this.state.register_passwordMsg}
            onChange={(event) => {
              this.setState({
                register_password: event.target.value,
                register_passwordError: false,
                register_passwordMsg: "",
              });
            }}
          />
          <TextField
            margin="dense"
            required
            fullWidth
            id="confirm-password"
            label="Confirm Password"
            type="password"
            value={this.state.confirmPassword}
            error={this.state.confirmPasswordError}
            helperText={this.state.confirmPasswordMsg}
            onChange={(event) => {
              this.setState({
                confirmPassword: event.target.value,
                confirmPasswordError: false,
                confirmPasswordMsg: "",
              });
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, fontSize: "18px" }}
            size="large"
            onClick={(event) => this.handleRegistration(event)}
          >
            Sign up
          </Button>
        </Box>

        <Stack
          direction={{ sm: "column", md: "row" }}
          alignItems="center"
          justifyContent="center"
          spacing={1}
        >
          <Typography
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Already have an account?
          </Typography>
          <Typography
            color="primary"
            onClick={() => this.setState({ login: !this.state.login })}
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              cursor: "pointer",
            }}
          >
            Log In
          </Typography>
        </Stack>
      </Stack>
    );
  };

  render() {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          width: "100%",
          minHeight: "100%",
          padding: "8px",
          overflow: "hidden",
        }}
      >
        {this.state.login ? this.loginForm() : this.registrationForm()}
      </Box>
    );
  }
}

export default LoginRegister;
