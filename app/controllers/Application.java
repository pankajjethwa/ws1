package controllers;

import play.*;
import play.libs.F.Promise;
import play.libs.WS;
import play.libs.WS.HttpResponse;
import play.libs.WS.WSRequest;
import play.mvc.*;
import play.mvc.Http.Response;

import java.io.InputStream;
import java.io.StringReader;
import java.util.*;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;
import javax.xml.transform.stream.StreamSource;

import org.w3c.dom.Document;

import com.google.gson.JsonElement;

import models.*;

public class Application extends Controller {

    public static void index() {
    	
    	//HttpResponse res = WS.url("http://www.bbc.co.uk").get();
    	WSRequest request = WS.url("http://www.thomas-bayer.com/sqlrest/CUSTOMER");
    	System.out.println(request);
    	
    	//Non blocking way async call
    	//Promise<HttpResponse> futureResp = request.getAsync();
    	//System.out.println(futureResp);

    	HttpResponse res = request.get();
    	int status = res.getStatus();
    	
    	String type = res.getContentType();
    	
    	String content = res.getString();
    	//Document xml = res.getXml();
    	//JsonElement json = res.getJson();
    	//InputStream is = res.getStream();
    	System.out.println(content);
        render(content);
    }

    public static void customers() {
    	
    	WSRequest request = WS.url("http://www.thomas-bayer.com/sqlrest/CUSTOMER");
    	System.out.println(request);
    	
    	//Non blocking way async call
    	//Promise<HttpResponse> futureResp = request.getAsync();
    	//System.out.println(futureResp);

    	HttpResponse res = request.get();
    	int status = res.getStatus();
    	
    	String type = res.getContentType();
    	
    	String content = res.getString();
    	//Document xml = res.getXml();
    	//JsonElement json = res.getJson();
    	//InputStream is = res.getStream();
    	System.out.println(content);
        render(content);
    }
    public static void customer(int id) {
    	
    	WSRequest request = WS.url("http://www.thomas-bayer.com/sqlrest/CUSTOMER/"+id);
    	System.out.println(request);
    	
    	//Non blocking way async call
    	//Promise<HttpResponse> futureResp = request.getAsync();
    	//System.out.println(futureResp);

    	HttpResponse res = request.get();
    	int status = res.getStatus();
    	
    	String type = res.getContentType();
    	
    	String content = res.getString();
    	//Document xml = res.getXml();
    	//JsonElement json = res.getJson();
    	//InputStream is = res.getStream();
    	System.out.println(content);

    	Customer cust = new Customer();
        try {
			JAXBContext jc = JAXBContext.newInstance(Customer.class);
			Unmarshaller u = jc.createUnmarshaller();
			StringBuffer xmlStr = new StringBuffer( content);
			Object o = u.unmarshal( new StreamSource( new StringReader( xmlStr.toString() ) ) );
			cust = (Customer)o;
			
		} catch (JAXBException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
         	
    	
    	
    	render(content,cust);
    }
}