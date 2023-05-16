import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, HashRouter } from "react-router-dom";

import Main from "./views/Main";
import Auth from "./views/Auth";
import Stake from "./views/Stake";
import Explorer from "./views/Explorer";
import AddStake from "./views/AddStake";

const App = () => {
  const [user, setUser] = useState({});

  useEffect(() => {}, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/stake" element={<Stake />} />
        <Route path="/explorer" element={<Explorer />} />
        <Route path="/addStake" element={<AddStake />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
