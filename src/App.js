import React, {Component} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'reactstrap/es/Button';
import Form from "reactstrap/es/Form";
import FormGroup from "reactstrap/es/FormGroup";
import Table from "reactstrap/es/Table";
import Spinner from "reactstrap/es/Spinner";
import Label from "reactstrap/es/Label";

function matrix(rows, cols, defaultValue) {
    const arr = [];
    // Creates all lines:
    for (let i = 0; i < rows; i++) {
        // Creates an empty line
        arr.push([]);
        // Adds cols to the empty line:
        arr[i].push(new Array(cols));
        for (let j = 0; j < cols; j++) {
            // Initializes:
            arr[i][j] = defaultValue;
        }
    }
    return arr;
}

class App extends Component {
    state = {
        counting: false,
        lines: 10,
        columns: 10,
        /**
         * @type {boolean[][]}
         */
        map: matrix(10, 10, false),
        numIsland: 0,
        /**
         * @type {number[][]}
         */
        numMap: matrix(10, 10, 0),
        /**
         * @type {boolean}
         */
        lock: false,
        /**
         * @type {number}
         */
        groundPercentage: 0.5,
    };

    render() {
        return (
            <div className="App d-flex flex-column justify-content-center align-items-center">
                <h1>Islands</h1>
                <Form>
                    <FormGroup row={true} className="d-flex justify-content-center">
                        <Button className="mr-2" color="success" onClick={this.countIsland} disabled={this.state.lock}>Count</Button>
                        <Button color="danger" onClick={this.resetCount} disabled={this.state.lock}>Reset</Button>
                    </FormGroup>
                    <FormGroup row={true} className="d-flex justify-content-center">
                        <input value={this.state.lines} placeholder={"Lines"}
                               className="d-inline-block form-control form-control-sm mr-2"
                               style={{
                                   maxWidth: "100px"
                               }}
                               type={"number"}
                               min={0}
                               onChange={event =>
                                   this.setState({
                                       lines: event.target.value,
                                       map: matrix(event.target.value, this.state.columns, false),
                                       numMap: matrix(event.target.value, this.state.columns, 0),
                                   })}/>
                        {" x "}
                        <input value={this.state.columns} placeholder={"Columns"}
                               type={"number"}
                               className="d-inline-block form-control form-control-sm ml-2"
                               style={{
                                   maxWidth: "100px"
                               }}
                               min={0}
                               onChange={event =>
                                   !this.state.counting &&
                                   this.setState({
                                       columns: event.target.value,
                                       map: matrix(this.state.lines, event.target.value, false),
                                       numMap: matrix(event.target.value, this.state.columns, 0),
                                   })}/>
                    </FormGroup>
                    <FormGroup row={true} className="d-flex justify-content-center align-items-center">
                        <Label className="mr-2">Ground percentage :</Label>
                        <input value={this.state.groundPercentage} placeholder={"Ground percentage"}
                               type={"number"}
                               className="d-inline-block form-control form-control-sm w-auto"
                               min={0} max={1} step={0.01}
                               style={{
                                   maxWidth: "100px"
                               }}
                               onChange={event =>
                                   !this.state.counting &&
                                   this.setState({
                                       groundPercentage: event.target.value,
                                   })}/>
                        <Button color="warning" onClick={this.randomlyGenerate}
                                disabled={this.state.lock}>Random</Button>
                    </FormGroup>
                </Form>
                {
                    this.state.lines > 0 && this.state.columns > 0 &&
                    <Table bordered={true} className="w-auto" key={this.state.lines + " " + this.state.columns}>
                        <tbody>
                        {
                            this.state.map.map((line, lineIndex) => <tr key={lineIndex}>
                                {
                                    line.map((col, colIndex) =>
                                        <td key={colIndex}
                                            onClick={() => this.toggleGroundSea(lineIndex, colIndex)}
                                            className={col ? "ground" : "sea"}>
                                            {this.state.numMap[lineIndex] &&
                                            this.state.numMap[lineIndex][colIndex] > 0 ?
                                                this.state.numMap[lineIndex][colIndex] : ""}
                                        </td>)
                                }
                            </tr>)
                        }
                        </tbody>
                    </Table>
                }
                {
                    this.state.counting &&
                    <Spinner color="primary"/>
                }
                <p>Total islands : {this.state.numIsland}</p>
            </div>
        );
    }

    toggleGroundSea = (lineIndex, colIndex) =>
        !this.state.lock &&
        this.setState({
            map: this.state.map.map((line, _lineIndex) => {
                if (_lineIndex !== lineIndex)
                    return line;
                else
                    return line.map((cell, _colIndex) => {
                        if (_colIndex !== colIndex)
                            return cell;
                        else
                            return !cell;
                    });
            })
        });

    countIsland = () =>
        !this.state.counting &&
        this.setState({
            counting: true,
            numIsland: 0,
            lock: true,
        }, this.startDiscover);

    /**
     *
     * @type {number[][]}
     */
    numMap = [[]];

    numIsland = 0;

    startDiscover = () => {
        this.numMap = matrix(this.state.lines, this.state.columns, 0);
        this.numIsland = 0;
        for (let i = 0; i < this.numMap.length; i++) {
            for (let j = 0; j < this.numMap[i].length; j++) {
                if (this.state.map[i][j] && this.numMap[i][j] === 0) {
                    // Undiscovered land
                    this.numIsland++;
                    this.expand(i, j, this.numIsland);
                }
            }
        }
        this.setState({
            counting: false,
            numIsland: this.numIsland,
            numMap: this.numMap,
            lock: false,
        });
    };

    expand(line, col, numIsland) {
        this.numMap[line][col] = numIsland;
        console.log(line + " " + col + " " + numIsland);
        line - 1 >= 0 && this.state.map[line - 1][col] && this.numMap[line - 1][col] === 0 && this.expand(line - 1, col, numIsland);
        line + 1 < this.numMap.length && this.state.map[line + 1][col] && this.numMap[line + 1][col] === 0 && this.expand(line + 1, col, numIsland);
        col - 1 >= 0 && this.state.map[line][col - 1] && this.numMap[line][col - 1] === 0 && this.expand(line, col - 1, numIsland);
        col + 1 < this.numMap[0].length && this.state.map[line][col + 1] && this.numMap[line][col + 1] === 0 && this.expand(line, col + 1, numIsland);
    }

    resetCount = () => {
        this.setState({
            counting: false,
            lock: false,
            lines: 10,
            columns: 10,
            map: matrix(10, 10, false),
            numMap: matrix(10, 10, 0),
            numIsland: 0,
        })
    };

    randomlyGenerate = () => !this.state.lock &&
        this.setState({
            counting: false,
            lock: false,
            numIsland: 0,
            map: this.state.map.map((line) => line.map(() => Math.random() < this.state.groundPercentage)),
            numMap: this.state.numMap.map((line) => line.map(() => 0)),
        });
}

export default App;
