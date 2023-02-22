There are three files in this memory server implementation. 

- mem_server.c implements the memory storage and its interfaces. 
  The interfaces are mem_service_init(), set_data_to_mem_priority(), 
  get_data_from_mem(), and mem_service_finish().

- mem_server.h contains function prototypes of the interfaces. 

- test_mem.c shows example usages of the interfaces to write 
  and retrieve data to and from the memory storage. 

To compile and run: 

shell> gcc -c mem_server.c test_mem.c
shell> gcc -o ms mem_server.o test_mem.o -lpthread
shell> ./ms
