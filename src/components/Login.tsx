import React from "react";
import netlifyIdentity from "netlify-identity-widget";

export default function Login() {
  const open = () => {
    netlifyIdentity.open();
  };

  return (
    <div>
      <h2>Sign in</h2>
      <p>Use Netlify Identity to authenticate users.</p>
      <button onClick={open}>Open Sign-in</button>
    </div>
  );
}
