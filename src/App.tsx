import { Fab, Stack, Typography } from "@mui/material";
import React, { useState } from "react";
import useTransactions from "./useTransactions";
import CurrentFilter from "./CurrentFilter";
import useFilters from "./useFilters";
import { Add } from "@mui/icons-material";
import FileSelector from "./FileSelector";
import Tabs from "./Tabs";
import MyFilters from "./MyFilters";
import { Filter, emptyFilter, Transaction } from "./types";

function App() {
  const { myFilters, saveFilter, toggleFilter, deleteFilter } = useFilters();

  const { transactions, setCategory, setTransactions } =
    useTransactions();
  const [currentFilter, setCurrentFilter] = useState<Filter>(emptyFilter);

  const [fileSelectorOpen, setFileSelectorOpen] = useState(false);

  function includesAny(value: string, searchTerms: string[]): boolean {
    if (!searchTerms) {
      return true;
    }

    for (let term of searchTerms) {
      term = term.toLowerCase();
      if (term.startsWith("!")) {
        if (!value.includes(term.substring(1))) return true;
      } else if (value.includes(term)) {
        return true;
      }
    }

    return false;
  }

  function amountMatches(amount: number, query: string[]): boolean {
    if (!query) {
      return true;
    }

    for (let q of query) {
      let op = q[0];
      let value;

      try {
        value = Number.parseFloat(q.substring(1));
      } catch {
        continue;
      }

      switch (op) {
        case ">":
          if (amount >= value) return true;
          break;
        case "<":
          if (amount <= value) return true;
          break;
        default:
          return true;
      }
    }

    return false;
  }

  function applyFilters(transactions: Transaction[], filters: Filter[]): Transaction[]{
    let filtered = transactions;
    for (let f of filters) {
      if (!f.enabled) {
        continue;
      }

      let q = f.query;

      filtered = filtered
        .filter((t) =>
          includesAny(t.description.toLowerCase() + t.categ.toLowerCase(), q.text)
        )
        .filter((t) => includesAny(t.description.toLowerCase(), q.desc))
        .filter((t) => includesAny(t.categ.toLowerCase(), q.categ))
        .filter((t) => includesAny(t.date.format("YYYY"), q.y))
        .filter((t) => includesAny(t.date.format("MM"), q.m))
        .filter((t) => includesAny(t.date.format("DD"), q.d))
        .filter((t) => amountMatches(t.amount, q.amount));
    }

    return filtered;
  }

  const filtered = applyFilters(transactions, [...myFilters, currentFilter]);
  const currentFilterResults = applyFilters(transactions, [currentFilter]);

  function openFileSelector() {
    setFileSelectorOpen(true);
  }

  return (
    <Stack
      sx={{ margin: "auto", height: "98vh", padding: "1vh", maxWidth: 1200 }}
    >
      <Stack sx={{ flexDirection: "row", alignItems: "center" }}>
        <Typography sx={{ marginRight: 2 }} variant="h2">
          Finances
        </Typography>
        <CurrentFilter
          filter={currentFilter}
          setFilter={setCurrentFilter}
          saveFilter={saveFilter}
        />
      </Stack>

      <Stack sx={{ overflow: "hidden", flex: 1, flexDirection: "row" }}>
        <MyFilters
          sx={{ flex: 1, margin: 2 }}
          {...{ myFilters, toggleFilter, deleteFilter }}
        ></MyFilters>
        <Tabs
          sx={{ flex: 5, margin: 2 }}
          {...{
            filtered,
            currentFilterResults,
            setCategory,
          }}
        />
      </Stack>

      <Fab size="small" sx={{ position: "absolute", bottom: 25, right: 25 }}>
        <Add onClick={openFileSelector} />
      </Fab>
      <FileSelector
        open={fileSelectorOpen}
        setOpen={setFileSelectorOpen}
        setTransactions={setTransactions}
      ></FileSelector>
    </Stack>
  );
}

export default App;
