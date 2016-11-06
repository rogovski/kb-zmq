import numpy as np
import zmq
import msgpack

# attempt to connect to an endpoint that doesnt exist
#
ctx = zmq.Context()
outChan = 'tcp://127.0.0.1:8844'
outSock = ctx.socket(zmq.PUSH)
outSock.bind(outChan)
