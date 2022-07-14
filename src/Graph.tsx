import React, { Component } from "react";
import { Table } from "@jpmorganchase/perspective";
import { ServerRespond } from "./DataStreamer";
import { DataManipulator } from "./DataManipulator";
import "./Graph.css";

interface IProps {
  data: ServerRespond[];
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void;
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement("perspective-viewer");
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName(
      "perspective-viewer"
    )[0] as unknown as PerspectiveViewerElement;

    const schema = {
      price_abc: "float",
      price_def: "float",
      ratio: "float",
      timestamp: "date",
      upper_bound: "float",
      lower_bound: "float",
      trigger_alert: "float",
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute("view", "y_line"); // visualize the data as y_line
      elem.setAttribute("row-pivots", '["timestamp"]'); //row-pivots takes care of our x-axis. Allows us to map each datapoint based ont eh timestamp it has.

      //focus on the particular part of the datapoint's data along the y-axis
      elem.setAttribute(
        "columns",
        '["ratio", "lower_bound","upper_bound", "trigger_alert"]'
      );

      // 'aggregates' will allow us to handle the cases of duplicated data we observed from task 2, and consolidate them as just one data point.
      elem.setAttribute(
        "aggregates",
        JSON.stringify({
          price_abc: "avg",
          price_def: "avg",
          ratio: "avg",
          timestamp: "distinct count",
          upper_bound: "avg",
          lower_bound: "avg",
          trigger_alert: "avg",
        })
      );
    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update([DataManipulator.generateRow(this.props.data)]);
    }
  }
}

export default Graph;
