import React, { useState, useMemo } from "react";

function StateProvider({ context, children }) {
  const StateContext = context;
  const [nombre, setNombre] = useState("");
  const [q, setQ] = useState("");
  const [login, setLogin] = useState(true);
  const [user, setUser] = useState(false);
  
 



  const contextValue = useMemo(
    () => ({
      nombre,
      setNombre,
      q,
      setQ,
      login,
      setLogin,
      user,
      setUser,
    }),
    [
      nombre,
      q,
      login,
      user,
    ]
  );

  return (
    <StateContext.Provider value={contextValue}>
      {children}
    </StateContext.Provider>
  );
}

export default StateProvider;
