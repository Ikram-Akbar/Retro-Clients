import { Link } from "react-router";

const NotFound = () => {
    return (
        <div>
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <p>Please check the URL and try again.</p>
            {/* You can also add a link to navigate back to the home page */}   
            <Link to="/">Go back to Home</Link>
        </div>
    );
};

export default NotFound;