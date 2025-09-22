import NavBar from "./NavBar";
import logo from "./img/logoalfallo.png";

import { Link } from "react-router-dom";
const Header = () => {
    return (
        <div className=" py-2 fixed-top cabecera">
            <div className="container">
                <div className="row align-items-end mb-3">
                    <div className="col d-flex gap-2 justify-content-md-center">
                        {/* <img className="d-md-none" src={logo} alt="logo de fragances.net" width={23} />
                        <h1 className="">FRAGANCES.NET</h1> */}
                        <Link to ={"/"}><img className="w-50" src={logo} alt="logo de fragances.net"  /></Link>

                    </div>
                </div>
                <NavBar />
            </div >
        </div>
    )
}
export default Header;
