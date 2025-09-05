import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useUser } from "../contexts/UserContext";
import { List, ListItem, ListItemText, Button, TextField } from "@mui/material";

export default function AuditList() {
  const { user } = useUser();
  const [audits, setAudits] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user) fetchAudits();
  }, [user]);

  const fetchAudits = async () => {
    const { data } = await supabase.from("audits").select("*");
    setAudits(data || []);
  };

  const filteredAudits = audits.filter((a) => a.title.includes(search));

  return (
    <div>
      <h2>Audits</h2>
      <TextField
        label="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Button component={Link} to="/audits/new">
        New Audit
      </Button>
      <List>
        {filteredAudits.map((audit) => (
          <ListItem key={audit.id}>
            <ListItemText primary={audit.title} secondary={audit.status} />
            <Button component={Link} to={`/audits/${audit.id}`}>
              Edit
            </Button>
          </ListItem>
        ))}
      </List>
    </div>
  );
}