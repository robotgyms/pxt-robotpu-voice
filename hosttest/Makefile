TARGET = puvoice
CXX = clang++
CXXFLAGS = -g -Wall -Wno-narrowing -std=c++11

OBJECTS = main.o sam.o render.o reciter.o debug.o
HTEST_OBJECTS = htest.o sam.o render.o reciter.o debug.o

default: $(TARGET) htest

main.o: main.cpp
	$(CXX) $(CXXFLAGS) -c main.cpp -o $@

htest.o: htest.cpp
	$(CXX) $(CXXFLAGS) -c htest.cpp -o $@

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

htest: $(HTEST_OBJECTS)
	$(CXX) $(HTEST_OBJECTS) -o $@

clean:
	rm -f *.o $(TARGET) htest out.wav
