const Hospital = artifacts.require("Hospital");
require('chai')
    .use(require('chai-as-promised'))
    .should();

contract(Hospital, ([deployer, patient1, patient2]) => {
    let hospital;
    before(async() => {
        hospital = await Hospital.deployed();

    });

    describe('Deployment', async() => {
        it('The deployment of hospital should be done successfully', async() => {
            const address = await hospital.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            //guaratee the address is not zero;
        })
        it('The deployed smart contract has the correct hospitalName', async() => {
            const hospitalName = await hospital.hospitalName();
            assert.equal(hospitalName, "shenyue HOSPITAL");
        })

    });


    describe('Book and Cancel an appointment', async() => {
        let appointment, appointmentCount;
        before(async() => {
            appointment = await hospital.bookAppointment('Lihua', 'Dr.David', '101', { from: patient1 });
            //appointment = await hospital.bookAppointment('Xiaoming', 'Dr.Susan', '102', { from: patient2 });
            appointmentCount = await hospital.appointmentCount();
        })

        it('Booking an appointment should be successful if all is correct', async() => {
            assert.equal(appointmentCount, 1);
            const event = appointment.logs[0].args;
            assert.equal(event.appointmentId.toNumber(), 1);
            assert.equal(event.isBooked, true);
            assert.equal(await hospital.hasAppoint(event.patient), true);
        })

        it('Check the appointment booked', async() => {
            const appoint_check = await hospital.appointments(appointmentCount, patient1);
            assert.equal(appoint_check.appointmentId.toNumber(), 1);
            assert.equal(appoint_check.patientName, 'Lihua');
            assert.equal(appoint_check.doctorName, 'Dr.David');
            assert.equal(appoint_check.roomId.toNumber(), 101);
            assert.equal(appoint_check.isBooked, true);
        })

        it('Booking an appointment by person who already had one should be rejected', async() => {
            await hospital.bookAppointment('Lihua', 'Dr.David', '102', { from: patient1 }).should.be.rejected;
        })

        it('Cancelling an appointment with wrong appointmentId should be rejected', async() => {
            await hospital.cancelAppointment(3, { from: patient2 }).should.be.rejected;
        })

        it('Cancelling an appointment by another person should be rejected', async() => {
            const appoint = await hospital.appointments(appointmentCount, patient1);
            await hospital.cancelAppointment(appoint.appointmentId, { from: patient2 }).should.be.rejected;
        })

        it('Cancelling an appointment should be successful if all is correct', async() => {
            const appoint = await hospital.appointments(appointmentCount, patient1);
            appointment = await hospital.cancelAppointment(appoint.appointmentId, { from: patient1 });
            const eventCancel = appointment.logs[0].args;
            assert.equal(eventCancel.isBooked, false);
            assert.equal(await hospital.hasAppoint(eventCancel.patient), false);

        })

        it('Booking an appointment with invalid inputs should be rejected', async() => {
            await hospital.bookAppointment('', 'Dr.David', '102', { from: patient2 }).should.be.rejected;
            await hospital.bookAppointment('Lihua', '', '102', { from: patient2 }).should.be.rejected;
            await hospital.bookAppointment('Lihua', 'Dr.David', '300', { from: patient2 }).should.be.rejected;
        })


    });

})