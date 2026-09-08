# GLORP

###### Generic Lightweight Object Representation Protocol

```mermaid
xychart-beta
    title "Encoded size — lower is better"
    x-axis ["GLORP", "JSON UTF-8"]
    y-axis "Bytes" 0 --> 120000
    bar [34810, 109091]
```

```mermaid
xychart-beta
    title "Encoding — lower is better"
    x-axis ["GLORP", "JSON string", "JSON UTF-8"]
    y-axis "Median ms per payload" 0 --> 0.7
    bar [0.6336, 0.1008, 0.1659]
```

```mermaid
xychart-beta
    title "Decoding — lower is better"
    x-axis ["GLORP", "JSON string", "JSON UTF-8"]
    y-axis "Median ms per payload" 0 --> 2.2
    bar [1.9793, 0.4075, 0.4407]
```

Measured on 1.000 generated user records with the same key structure and repeated names.
Uncompressed output; medians of seven rounds of 1,000 operations after 200 warm-up operations per case.

JSON string measures `JSON.stringify` and `JSON.parse`.
JSON UTF-8 additionally includes conversion to/from UTF-8 bytes.

Node v26.8.1 · Windows x64 · Intel Core i7-1355U.

On this machine (my work machine) and workload, GLORP uses **68.09% fewer bytes**, but takes **3.82× as long to encode** and **4.49× as long to decode** as JSON UTF-8.
This workload benefits deduplication; results are not representative of every payload.