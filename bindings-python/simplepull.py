import zmq
import msgpack
import os

print os.environ['TENSORFLOW_PORT_8888_TCP']

ctx = zmq.Context()

inChan = os.environ['TENSORFLOW_PORT_8888_TCP']
inSock = ctx.socket(zmq.PULL)
inSock.connect(inChan)

while True:
    result = inSock.recv()
    decoded = msgpack.unpackb(result)
    print decoded
