pragma solidity ^0.5.0;

contract Hospital{
string public hospitalName;
uint public appointmentCount = 0;
struct Appointment{
    uint appointmentId;
    string patientName;
    string doctorName;
    uint roomId;
    address payable patient;
    bool isBooked;
}
mapping(address => bool) public hasAppoint;
mapping (uint=> mapping(address => Appointment)) public appointments;

event AppointmentBooked(uint appointmentId, string patientName, string doctorName, uint roomId, address payable patient, bool isBooked);
event AppointmentCancelled(uint appointmentId, string patientName, string doctorName, uint roomId, address payable patient, bool isBooked);

constructor() public{
    hospitalName = "shenyue HOSPITAL";
}

function bookAppointment(string memory _patientName, 
string memory _doctorName, uint _roomId) public{
    require(!hasAppoint[msg.sender], "Only someone who has no appointment can book a new one");
    require(bytes(_patientName).length > 0, "Patient's name is required!");
    require(bytes(_doctorName).length > 0, "Doctor's name is required!");
    require(_roomId >= 100 && _roomId <= 200, "Room Id is between 100 and 200");
    appointmentCount++;
    appointments[appointmentCount][msg.sender] = Appointment(appointmentCount, _patientName, _doctorName, _roomId, msg.sender, true);
    hasAppoint[msg.sender] = true;

    emit AppointmentBooked(appointmentCount, _patientName, _doctorName, _roomId, msg.sender, true);

}

function cancelAppointment(uint _appointmentId) public{
    require(hasAppoint[msg.sender], "This person should have booked an appointment");
    require(_appointmentId > 0 && _appointmentId <= appointmentCount, "Appointment to be cancelled should be valid");
    Appointment memory _appoint = appointments[_appointmentId][msg.sender];
    require(_appoint.isBooked, "The status of appointment should be booked");
    _appoint.isBooked = false;
    appointments[_appointmentId][msg.sender] = _appoint;
    hasAppoint[msg.sender] = false;

    emit AppointmentCancelled(_appointmentId, _appoint.patientName, _appoint.doctorName, _appoint.roomId, msg.sender, false);


}


}