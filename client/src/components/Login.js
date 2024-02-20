import React, { useContext, useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Container,
  Row,
  Col,
  Form,
  FormLabel,
  Button,
  Alert,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { loginUser, registerUser } from "./Axios";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import { useForm } from "react-hook-form";
import { FiAlertTriangle } from "react-icons/fi";

function Login({ context }) {
  const white = { color: "white" };
  const red = { color: "#dc3545" };
  const messages = {
    req: "Este campo es obligatorio",
    mail: "Debes introducir una dirección correcta",
    password:
      "Debes introducir una contraseña con al menos 8 caracteres con digitos, con un caracter en minúscula y mayúscula y un caracter especial",
  };
  const patterns = {
    mail: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
  };
  const { login, setLogin, user, setUser } = useContext(context);
  const [show, setShow] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState,
    watch,
    formState: { errors, isSubmitSuccessful },
  } = useForm({ mode: "onTouched" });
  const navigate = useNavigate();

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset({ name: "", password: "" });
    }
  }, [formState, reset]);

  const onGoogleSignIn = async (res) => {
    let userCred = res.credential;
    let payload = jwtDecode(userCred);
    const newUser = {
      userName: payload.name,
      email: payload.email,
      password: "",
      google: true,
    };
    let usuario = await registerUser(newUser);
    if (usuario.status === 201) {
      console.log("Usuario creado");
      setUser(true);
      navigate("/marketplace");
    } else {
      setUser(true);
      navigate("/marketplace");
    }
  };

  const registrar = () => {
    setLogin((prev) => !prev);
  };

  const onLogin = async (userInfo) => {
    const newUser = {
      userName: userInfo.name,
      email: "",
      password: userInfo.password,
      google: false,
    };
    const usuario = await loginUser(newUser);
    if (usuario.status === 202) {
      setUser(true);
      navigate("/marketplace");
    } else {
      setMensaje("Usuario o la contraseña están mal.");
      setShow(true);
    }
  };

  const onRegister = async (userInfo) => {
    const newUser = {
      userName: userInfo.nameRegister,
      email: userInfo.emailRegister,
      password: userInfo.passwordRegister,
      google: false,
    };
    const usuario = await registerUser(newUser);
    if (usuario.status === 201) {
      console.log("Usuario creado");
      registrar();
    } else {
      setMensaje("Ya existe una cuenta con este correo electronico.");
      setShow(true);
    }
  };

  return (
    <Container className="container-with-bg w-75 rounded shadow mt-3">
      {show && (
        <Alert variant="danger" onClose={() => setShow(false)} dismissible>
          {mensaje}
        </Alert>
      )}
      <Row className="align-items-stretch">
        <Col className="bg d-none d-lg-block col-md-5 col-lg-5 col-xl-6 rounded"></Col>
        <Col className="p-5 rounded-end">
          <div className="text-end">
            <img src="/public/logo.png" width="48" alt="" />
          </div>
          <h2 className="fw-bold text-center py-5" style={{ color: "#20f299" }}>
            {login ? "Bienvenidos" : "Crea una nueva cuenta"}
          </h2>
          {login ? (
            <Form onSubmit={handleSubmit(onLogin)}>
              <div className="mb-4">
                <FormLabel style={white}>Usuario</FormLabel>
                <Form.Control
                  {...register("name", { required: messages.req })}
                  type="text"
                  placeholder="User Name"
                />
                {errors.name && (
                  <div style={{ marginTop: "5px" }}>
                    <label style={red}>
                      <FiAlertTriangle style={{ marginBottom: "4px" }} />{" "}
                      {errors.name.message}
                    </label>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <FormLabel style={white}>Contraseña</FormLabel>
                <Form.Control
                  {...register("password", {
                    required: messages.req,
                    pattern: {
                      value: patterns.password,
                      message: messages.password,
                    },
                  })}
                  type="password"
                  placeholder="Password"
                />
                {errors.password && (
                  <div style={{ marginTop: "5px" }}>
                    <label style={red}>
                      <FiAlertTriangle style={{ marginBottom: "4px" }} />{" "}
                      {errors.password.message}
                    </label>
                  </div>
                )}
              </div>
              <div className="d-grid">
                <Button className="btn btn-custom-color" type="submit" variant="outline-primary">
                  Login
                </Button>
              </div>
              <div className="my-3">
                <span style={white}>
                  ¿No tienes cuenta?{" "}
                  <Link onClick={registrar} to="/" style={{ color: "#007bff" }}>
                    Sign Up
                  </Link>
                </span>
                <br />
              </div>
            </Form>
          ) : (
            <Form onSubmit={handleSubmit(onRegister)}>
              <div className="mb-4">
                <FormLabel style={white}>Usuario</FormLabel>
                <Form.Control
                  {...register("nameRegister", { required: messages.req })}
                  type="text"
                  placeholder="User Name"
                />
                {errors.nameRegister && (
                  <div style={{ marginTop: "5px" }}>
                    <label style={red}>
                      <FiAlertTriangle style={{ marginBottom: "4px" }} />{" "}
                      {errors.nameRegister.message}
                    </label>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <FormLabel style={white}>Contraseña</FormLabel>
                <Form.Control
                  {...register("passwordRegister", {
                    required: messages.req,
                    pattern: {
                      value: patterns.password,
                      message: messages.password,
                    },
                  })}
                  type="password"
                  placeholder="Password"
                />
                {errors.passwordRegister && (
                  <div style={{ marginTop: "5px" }}>
                    <label style={red}>
                      <FiAlertTriangle style={{ marginBottom: "4px" }} />{" "}
                      {errors.passwordRegister.message}
                    </label>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <FormLabel style={white}>Repetir Contraseña</FormLabel>
                <Form.Control
                  {...register("confirm_password", {
                    required: messages.req,
                    validate: (val) => {
                      if (watch("passwordRegister") !== val) {
                        return "Tu contraseña no coincide";
                      }
                    },
                  })}
                  type="password"
                  placeholder="Password"
                />
                {errors.confirm_password && (
                  <div style={{ marginTop: "5px" }}>
                    <label style={red}>
                      <FiAlertTriangle style={{ marginBottom: "4px" }} />{" "}
                      {errors.confirm_password.message}
                    </label>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <FormLabel style={white}>Correo Electrónico</FormLabel>
                <Form.Control
                  {...register("emailRegister", {
                    required: messages.req,
                    pattern: {
                      value: patterns.mail,
                      message: messages.mail,
                    },
                  })}
                  type="email"
                  placeholder="Email"
                />
                {errors.emailRegister && (
                  <div style={{ marginTop: "5px" }}>
                    <label style={red}>
                      <FiAlertTriangle style={{ marginBottom: "4px" }} />{" "}
                      {errors.emailRegister.message}
                    </label>
                  </div>
                )}
              </div>
              <div className="d-grid">
                <Button type="submit" variant="outline-primary" className="btn btn-custom-color">
                  Sign Up
                </Button>
              </div>
              <div className="my-3">
                <span style={white}>
                  ¿Ya tienes cuenta?{" "}
                  <Link onClick={registrar} to="/" style={{ color: "#007bff" }}>
                    Login
                  </Link>
                </span>
              </div>
            </Form>
          )}
          {login && (
            <GoogleLogin
              onSuccess={onGoogleSignIn}
              onError={() => {
                console.log("Login Failed");
              }}
              isSignedIn={true}
              useOneTap
              auto_select
            />
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
