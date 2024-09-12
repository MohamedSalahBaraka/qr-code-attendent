"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Constants_1 = require("./Constants");
class Snowflake {
    constructor(workerId, datacenterId) {
        this.twepoch = 1288834974657n; // Twitter's epoch in milliseconds
        this.sequence = 0n;
        // Define bit lengths for each part of the Snowflake ID
        this.workerIdBits = 5n;
        this.datacenterIdBits = 5n;
        this.sequenceBits = 12n;
        // Define maximum values for workerId, datacenterId, and sequence
        this.maxWorkerId = -1n ^ (-1n << this.workerIdBits);
        this.maxDatacenterId = -1n ^ (-1n << this.datacenterIdBits);
        this.sequenceMask = -1n ^ (-1n << this.sequenceBits);
        // Bit shifts for each part of the Snowflake ID
        this.workerIdShift = this.sequenceBits;
        this.datacenterIdShift = this.sequenceBits + this.workerIdBits;
        this.timestampLeftShift = this.sequenceBits + this.workerIdBits + this.datacenterIdBits;
        // The last timestamp a Snowflake ID was generated
        this.lastTimestamp = -1n;
        // Ensure workerId and datacenterId are within allowable ranges
        if (workerId > Number(this.maxWorkerId) || workerId < 0) {
            throw new Error(`workerId must be between 0 and ${this.maxWorkerId}`);
        }
        if (datacenterId > Number(this.maxDatacenterId) || datacenterId < 0) {
            throw new Error(`datacenterId must be between 0 and ${this.maxDatacenterId}`);
        }
        this.workerId = BigInt(workerId);
        this.datacenterId = BigInt(datacenterId);
    }
    // Generate the next Snowflake ID
    nextId() {
        let timestamp = this.currentTime();
        // If the current timestamp is less than the last timestamp, throw an error
        if (timestamp < this.lastTimestamp) {
            throw new Error("Clock moved backwards. Refusing to generate id for ${this.lastTimestamp - timestamp} milliseconds");
        }
        // If the current timestamp is equal to the last timestamp, increment the sequence
        if (this.lastTimestamp === timestamp) {
            this.sequence = (this.sequence + 1n) & this.sequenceMask;
            // If the sequence overflows, wait for the next millisecond
            if (this.sequence === 0n) {
                timestamp = this.waitForNextMillis(this.lastTimestamp);
            }
        }
        else {
            // If the current timestamp is different, reset the sequence
            this.sequence = 0n;
        }
        this.lastTimestamp = timestamp;
        // Construct the Snowflake ID
        return (((timestamp - this.twepoch) << this.timestampLeftShift) |
            (this.datacenterId << this.datacenterIdShift) |
            (this.workerId << this.workerIdShift) |
            this.sequence);
    }
    // Wait for the next millisecond
    waitForNextMillis(lastTimestamp) {
        let timestamp = this.currentTime();
        while (timestamp <= lastTimestamp) {
            timestamp = this.currentTime();
        }
        return timestamp;
    }
    // Get the current time in milliseconds as a BigInt
    currentTime() {
        return BigInt(Date.now());
    }
}
const snowflake = new Snowflake(Constants_1.WORKER_ID, Constants_1.DATA_CENTER_ID);
exports.default = snowflake;
