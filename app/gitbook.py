#!/usr/bin/env python
# http://blog.modp.com/2008/11/minimal-http-file-server-in-python.html
# v1.0 23-Nov-2008 Nick Galbreath
# PUBLIC DOMAIN, but it would be nice if you gave me credit ;-)                      
import os, os.path, mimetypes, wsgiref.simple_server
import json

port = 8000  # anything
root = os.path.expanduser('/data/prj/gb/gitbook/') #TODO

def makelink(dir, file):
    link = (os.path.join(dir,file))[len(root):]
    return '<a href="%s">%s</a><br>\n' % (link, file)
def run(environ, start_response):
    cmd = environ['PATH_INFO']
    filename = os.path.abspath(os.path.join(root,cmd[cmd.find('/')+1:]))
    data = ''
    mtype = 'text/plain'
    if not filename.startswith(root):
        status = '403 Forbidden'
        data = 'Request outside of root directory\n'
    else:
        status = '200 OK'
        try:
            if os.path.isdir(filename):
                mtype = 'text/html'
                files = sorted(os.listdir(filename))
                links = [makelink(filename,f) for f in files]
                data = '<html><head><title>' + filename + \
                    '</title></head><body>\n' + makelink(filename, '..')+ \
                    ''.join(links) + '</body></html>\n'
            else:
                print environ['REQUEST_METHOD']
                if environ['REQUEST_METHOD'] == 'POST':
                    datasize = int(environ['CONTENT_LENGTH'])
                    data = environ['wsgi.input'].read(datasize)
                    f = open(filename, 'wb'); f.write(data); f.close()
                    
                    # Git update
                    os.system("bash save.sh")
                    
                    m = mimetypes.guess_type(filename)
                    
                    
                    if filename.endswith('.json'): mtype = 'application/json'
                    elif m[0] is not None: mtype = m[0]
                else:
                    f = open(filename); data = f.read(); f.close()
                    m = mimetypes.guess_type(filename)
                    if filename.endswith('.json'): mtype = 'application/json'
                    elif m[0] is not None: mtype = m[0]
        except IOError,e:
            data = str(e) + '\n'
            status = "404 Not Found"
    start_response(status, [('Content-Type', mtype)])
    return [ data ]
if __name__ == '__main__':
    httpd = wsgiref.simple_server.make_server('', port, run)
    sa = httpd.socket.getsockname()
    httpd.serve_forever()
