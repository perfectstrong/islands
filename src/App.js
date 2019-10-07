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
        /**
         * @type {{x: number, y: number}}
         */
        start: {x: -1, y: -1},
        /**
         * @type {{x: number, y: number}}
         */
        end: {x: -1, y: -1},
        onChooseStartPoint: false,
        onChooseEndPoint: false,
        onFindingPath: false,
        minDist: -1,
        /**
         * @type {boolean[][]}
         */
        shortestPath: [[]],
    };

    render() {
        return (
            <div className="App d-flex flex-column justify-content-center align-items-center">
                <h1>Islands</h1>
                <Form>
                    <FormGroup row={true} className="d-flex justify-content-center">
                        <Button className="mr-2" color="success" onClick={this.countIsland}
                                disabled={this.state.lock}>Count</Button>
                        <Button color="danger" onClick={this.reset} disabled={this.state.lock}>Reset</Button>
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
                                   !this.state.counting &&
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
                               className="d-inline-block form-control form-control-sm w-auto mr-2"
                               min={0} max={1} step={0.01}
                               style={{
                                   maxWidth: "100px"
                               }}
                               onChange={event =>
                                   !this.state.counting &&
                                   this.setState({
                                       groundPercentage: event.target.value,
                                   })}/>
                        <Button color="warning" onClick={this.randomlyGenerateGround}
                                disabled={this.state.lock}>Random</Button>
                    </FormGroup>
                    <FormGroup row={true} className="d-flex justify-content-center align-items-center">
                        <Button onClick={() => this.setState({onChooseStartPoint: !this.state.onChooseStartPoint})}
                                className="mr-2">Choose start point</Button>
                        <Button onClick={() => this.setState({onChooseEndPoint: !this.state.onChooseEndPoint})}
                                className="mr-2">Choose end point</Button>
                        <Button onClick={this.findShortestPath}>Find shortest path</Button>
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
                                            onClick={() =>
                                                this.state.onChooseStartPoint ?
                                                    this.toggleStartPoint(lineIndex, colIndex) :
                                                    this.state.onChooseEndPoint ?
                                                        this.toggleEndPoint(lineIndex, colIndex) :
                                                        this.toggleGroundSea(lineIndex, colIndex)}
                                            className={col ? "ground" :
                                                this.state.minDist > 0 && this.state.shortestPath[lineIndex][colIndex] ?
                                                    "sea-shortest" : "sea"
                                            }>
                                            {this.state.start.x === lineIndex && this.state.start.y === colIndex ? "S" :
                                                this.state.end.x === lineIndex && this.state.end.y === colIndex ? "E" :
                                                    this.state.numMap[lineIndex] &&
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
                    (this.state.counting || this.state.onFindingPath) && <Spinner color="primary"/>
                }
                <p>Total islands : {this.state.numIsland}</p>
                <p>Shortest path: {this.state.minDist}</p>
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
        console.log("Starting discovering");
        for (let i = 0; i < this.numMap.length; i++) {
            for (let j = 0; j < this.numMap[i].length; j++) {
                if (this.state.map[i][j] && this.numMap[i][j] === 0) {
                    // Undiscovered land
                    this.numIsland++;
                    this.expand(i, j, this.numIsland);
                }
            }
        }
        console.log("Discover terminated");
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

    reset = () =>
        this.setState({
            counting: false,
            lock: false,
            lines: 10,
            columns: 10,
            map: matrix(10, 10, false),
            numMap: matrix(10, 10, 0),
            numIsland: 0,
            start: {x: -1, y: -1},
            end: {x: -1, y: -1},
            onChooseStartPoint: false,
            onChooseEndPoint: false,
            onFindingPath: false,
            minDist: -1,
            shortestPath: [[]]
        });

    randomlyGenerateGround = () => !this.state.lock &&
        this.setState({
            counting: false,
            lock: false,
            numIsland: 0,
            map: this.state.map.map((line, lineIndex) => line.map((cell, colIndex) =>
                (lineIndex === this.state.start.x && colIndex === this.state.start.y)
                || (lineIndex === this.state.end.x && colIndex === this.state.end.y) ?
                    false : Math.random() < this.state.groundPercentage)),
            onChooseStartPoint: false,
            onChooseEndPoint: false,
            onFindingPath: false,
            minDist: -1,
            shortestPath: [[]],
        });

    toggleStartPoint = (lineIndex, colIndex) =>
        this.setState({
            onChooseStartPoint: false,
            start: lineIndex === this.state.start.x && colIndex === this.state.start.y ? {x: -1, y: -1} :
                (lineIndex === this.state.end.x && colIndex === this.state.end.y)
                || this.state.map[lineIndex][colIndex] ? this.state.start :
                    {x: lineIndex, y: colIndex},
        });

    toggleEndPoint = (lineIndex, colIndex) =>
        this.setState({
            onChooseEndPoint: false,
            end: lineIndex === this.state.end.x && colIndex === this.state.end.y ? {x: -1, y: -1} :
                (lineIndex === this.state.start.x && colIndex === this.state.start.y)
                || this.state.map[lineIndex][colIndex] ? this.state.end :
                    {x: lineIndex, y: colIndex},
        });

    findShortestPath = () =>
        this.state.start.x >= 0 && this.state.start.y >= 0 && this.state.end.x >= 0 && this.state.end.y >= 0 &&
        this.setState({
            onFindingPath: true,
            lock: true,
        }, this.startFinding);

    startFinding() {
        console.log("Start finding shortest path");
        let distMat = matrix(this.state.lines, this.state.columns, Number.MAX_SAFE_INTEGER);
        distMat[this.state.start.x][this.state.start.y] = 0;
        let visitMat = matrix(this.state.lines, this.state.columns, false);
        let precedingMat = matrix(this.state.lines, this.state.columns, null);
        let candidateNodes = []; // Initial candidates
        let currentNode = this.state.start;
        while (currentNode) {
            visitMat[currentNode.x][currentNode.y] = true;
            if (visitMat[this.state.end.x][this.state.end.y]) break;
            // Check if neighbor nodes exist
            // If new proposal dist is smaller, refresh distMat value
            // If node not visited, add to candidates
            if (currentNode.x - 1 >= 0 && !this.state.map[currentNode.x - 1][currentNode.y]
                && !visitMat[currentNode.x - 1][currentNode.y]) {
                candidateNodes.push({x: currentNode.x - 1, y: currentNode.y});
                if (distMat[currentNode.x][currentNode.y] + 1 <= distMat[currentNode.x - 1][currentNode.y]) {
                    distMat[currentNode.x - 1][currentNode.y] = distMat[currentNode.x][currentNode.y] + 1;
                    precedingMat[currentNode.x - 1][currentNode.y] = currentNode;
                }
            }
            if (currentNode.x + 1 < this.state.lines && !this.state.map[currentNode.x + 1][currentNode.y]
                && !visitMat[currentNode.x + 1][currentNode.y]) {
                candidateNodes.push({x: currentNode.x + 1, y: currentNode.y});
                if (distMat[currentNode.x][currentNode.y] + 1 <= distMat[currentNode.x + 1][currentNode.y]) {
                    distMat[currentNode.x + 1][currentNode.y] = distMat[currentNode.x][currentNode.y] + 1;
                    precedingMat[currentNode.x + 1][currentNode.y] = currentNode;
                }
            }
            if (currentNode.y - 1 >= 0 && !this.state.map[currentNode.x][currentNode.y - 1]
                && !visitMat[currentNode.x][currentNode.y - 1]) {
                candidateNodes.push({x: currentNode.x, y: currentNode.y - 1});
                if (distMat[currentNode.x][currentNode.y] + 1 <= distMat[currentNode.x][currentNode.y - 1]) {
                    distMat[currentNode.x][currentNode.y - 1] = distMat[currentNode.x][currentNode.y] + 1;
                    precedingMat[currentNode.x][currentNode.y - 1] = currentNode;
                }
            }
            if (currentNode.y + 1 < this.state.columns && !this.state.map[currentNode.x][currentNode.y + 1]
                && !visitMat[currentNode.x][currentNode.y + 1]) {
                candidateNodes.push({x: currentNode.x, y: currentNode.y + 1});
                if (distMat[currentNode.x][currentNode.y] + 1 <= distMat[currentNode.x][currentNode.y + 1]) {
                    distMat[currentNode.x][currentNode.y + 1] = distMat[currentNode.x][currentNode.y] + 1;
                    precedingMat[currentNode.x][currentNode.y + 1] = currentNode;
                }
            }
            // Sort to get the next nearest node
            let currentShortestDist = Number.MAX_SAFE_INTEGER;
            let index = -1;
            for (let i = 0; i < candidateNodes.length; i++) {
                if (distMat[candidateNodes[i].x][candidateNodes[i].y] < currentShortestDist) {
                    index = i;
                    currentShortestDist = distMat[candidateNodes[i].x][candidateNodes[i].y];
                }
            }
            if (index < 0) // No connection
                break;
            else {
                currentNode = candidateNodes[index];
                candidateNodes.splice(index, 1);
            }
        }
        // If cannot visit the end point, that means no path exists
        console.log("Terminating finding the shortest path");
        if (!visitMat[this.state.end.x][this.state.end.y]) {
            this.setState({
                onFindingPath: false,
                lock: false,
                minDist: -1,
                shortestPath: [[]]
            });
        } else {
            // Highlight the path
            let shortestPath = matrix(this.state.lines, this.state.columns, false);
            let nextNode = this.state.end;
            while (nextNode !== null) {
                console.log(nextNode.x + " " + nextNode.y);
                shortestPath[nextNode.x][nextNode.y] = true;
                nextNode = precedingMat[nextNode.x][nextNode.y];
            }
            this.setState({
                onFindingPath: false,
                lock: false,
                minDist: distMat[this.state.end.x][this.state.end.y],
                shortestPath,
            });
        }
    }
}

export default App;
