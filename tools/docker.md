## docker的四种网络模式
docker使用Linux桥接，在宿主机虚拟一个Docker容器网桥(docker0)，docker启动一个容器时会根据Docker网桥的网段分配给容器一个IP，Docker网桥是每个容器的默认网关，容器之前可以通过IP直接通信。
### host模式
如果启动容器的时候使用host模式，那么这个容器将不会获得一个独立的Network Namespace，而是和宿主机共用一个Network Namespace。容器将不会虚拟出自己的网卡，配置自己的IP等，而是使用宿主机的IP和端口。但是，容器的其他方面，如文件系统、进程列表等还是和宿主机隔离的。
缺点是宿主机上已经使用的端口不能再用，隔离性不好。
### container模式
新创建的容器与已经存在的一个容器共享一个network namespace，与该容器共享ip，端口范围
### none模式
Docker容器拥有自己的Network Namespace，但是，并不为Docker容器进行任何网络配置。也就是说，这个Docker容器没有网卡、IP、路由等信息。需要我们自己为Docker容器添加网卡、配置IP等。
### bridge模式
默认网络模式。从docker0分配一个IP给容器，设置docker0为容器的默认网关，在主机创建一对虚拟网卡，一段放在新创建的容器，命名为eth0，另一端放在主机，以vethxxx命名，并将这个网络加入docker0网桥

## docker容器与外网通信
容器默认可以访问外网：如果网桥 docker0 收到来自 172.17.0.0/16 网段的外出包，把它交给 MASQUERADE 处理。而 MASQUERADE 的处理方式是将包的源地址替换成 host 的地址发送出去，即做了一次网络地址转换（NAT）转换为 enp0s3的IP：10.0.2.15
外网访问容器：docker run -it -d --name=nginx01 -p 8081:80 nginx通过8081可以访问，使用了IPtables的DNAT功能，一些场景（ipv6，老内核）下使用docker-proxy。
