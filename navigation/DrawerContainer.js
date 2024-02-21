import React from "react";
import { Menu } from "../components";

// Wrapping in a functional component here as this is a requirement of the
// @react-navigation/drawer package. Menu is required to be a class component
// so that we can access the app settings via the Redux store.
function DrawerContainer(props) {
    return <Menu {...props}/>;
}

export default DrawerContainer;