import React from "react";

export default function AuditList({ user }: { user: any }) {
  return (
    <div>
      <h2>Audits</h2>
      {user ? <p>Welcome, {user?.user?.email}</p> : <p>Please sign in to see audits.</p>}
      <ul>
        <li>Audit: Safety Inspection - Draft</li>
        <li>Audit: Equipment Check - Completed</li>
      </ul>
    </div>
  );
}