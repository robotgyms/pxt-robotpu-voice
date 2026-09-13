TARGET = puvoice
CXX = clang++
CXXFLAGS = -g -Wall -Wno-narrowing -std=c++11

OBJECTS = main.o sam.o render.o reciter.o debug.o

default: $(TARGET)

main.o: main.cpp
	$(CXX) $(CXXFLAGS) -c main.cpp -o $@

sam.o: ../sam/sam.cpp
	$(CXX) $(CXXFLAGS) -c ../sam/sam.cpp -o $@

render.o: ../sam/render.cpp
	$(CXX) $(CXXFLAGS) -c ../sam/render.cpp -o $@

reciter.o: ../sam/reciter.cpp
	$(CXX) $(CXXFLAGS) -c ../sam/reciter.cpp -o $@

debug.o: ../sam/debug.cpp
	$(CXX) $(CXXFLAGS) -c ../sam/debug.cpp -o $@

$(TARGET): $(OBJECTS)
	$(CXX) $(OBJECTS) -o $@

clean:
	rm -f *.o $(TARGET) out.wav
