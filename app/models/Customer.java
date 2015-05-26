package models;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name="CUSTOMER")
public class Customer {

	
	int id;
	String firstName;
	String lastName;
	String street;
	String city;
	

	public Customer() {
		super();
		this.id = 0;
	}
	
	
	public Customer(int id) {
		super();
		this.id = id;
	}

@XmlElement(name="ID")
	public int getId() {
		return id;
	}


	public void setId(int id) {
		this.id = id;
	}

	@XmlElement(name="FIRSTNAME")
	public String getFirstName() {
		return firstName;
	}


	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	@XmlElement(name="LASTNAME")
	public String getLastName() {
		return lastName;
	}


	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	@XmlElement(name="STREET")
	public String getStreet() {
		return street;
	}


	public void setStreet(String street) {
		this.street = street;
	}

	@XmlElement(name="CITY")
	public String getCity() {
		return city;
	}


	public void setCity(String city) {
		this.city = city;
	}
}
