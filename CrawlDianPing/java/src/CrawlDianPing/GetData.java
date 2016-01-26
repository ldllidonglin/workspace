package CrawlDianPing;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import net.minidev.json.JSONArray;
import net.minidev.json.JSONValue;
import net.minidev.json.parser.ParseException;

import org.apache.http.HttpEntity;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

public class GetData
{
	public static void main(String args[]) throws IOException {
		searchShop();
	}
	
	/*
	 * 根据businessid 批量获取商家信息
	 */
	static int shopsIndex=1;
	public static void getBusInfoByIds(String bids) throws IOException {
		String apiUrl;
		String appKey = " ";    
		String secret = " ";
		Map<String, String> paramMap = new HashMap<String, String>();
		PrintWriter printWriter = new PrintWriter(new FileWriter(new File("D:/自学/大众点评/Data/2016/SH_DianPingShopsByBId.txt"), true));
		printWriter.println("id,name,branch_name,lat,lon,categories,avg_rating,avg_price,review_count,product_score,decoration_score,service_score,region,address");
		paramMap.put("business_ids",bids); 
		StringBuilder stringBuilder = new StringBuilder();
		// 对参数名进行字典排序
		String[] keyArray = paramMap.keySet().toArray(new String[0]);
		Arrays.sort(keyArray);
		// 拼接有序的参数名-值串
		stringBuilder.append(appKey);
		for (String key : keyArray)
		{
			stringBuilder.append(key).append(paramMap.get(key));
		}
		String codes = stringBuilder.append(secret).toString();
		// SHA-1编码， 这里使用的是Apache-codec，即可获得签名(shaHex()会首先将中文转换为UTF8编码然后进行sha1计算，使用其他的工具包请注意UTF8编码转换)
		String sign = org.apache.commons.codec.digest.DigestUtils.shaHex(codes).toUpperCase();	       
		// 添加签名
		stringBuilder = new StringBuilder(); 
		stringBuilder.append("appkey=").append(appKey).append("&sign=").append(sign);
		for (Entry<String, String> entry : paramMap.entrySet())
		{
			stringBuilder.append('&').append(entry.getKey()).append('=').append(entry.getValue());
		}
		String queryString = stringBuilder.toString();	        
		apiUrl="http://api.dianping.com/v1/business/get_batch_businesses_by_id?"+queryString;
		CloseableHttpClient httpclient = HttpClients.createDefault();  
		try {  
			// 创建httpget.    
			HttpGet httpget = new HttpGet(apiUrl);  
			System.out.println("executing request " + httpget.getURI());  
			// 执行get请求.    
			CloseableHttpResponse response = httpclient.execute(httpget);  
			try {  
				// 获取响应实体    
				HttpEntity entity = response.getEntity();  
				System.out.println("--------------------------------------");  
				// 打印响应状态    
				System.out.println(response.getStatusLine());  
				if (entity != null) {  
					// 打印响应内容长度    
					System.out.println("Response content length: " + entity.getContentLength());  
					// 打印响应内容    
					Map<String, Object> map = null;
					String content=EntityUtils.toString(entity);
					System.out.println(content);
					//try
					//{
						map = (Map<String, Object>) JSONValue.parse(content);
					//}
//					catch (ParseException e)
//					{
//						// TODO 自动生成的 catch 块
//						e.printStackTrace();
//					}

					//Object obj=JSONValue.parse(content);
					String status= (String) map.get("status");							                 
					if (status.equals("OK"))
					{
						int count=(int)map.get("count");
						System.out.println(count); 
						JSONArray businesses = (JSONArray) map.get("businesses");
						System.out.println(businesses);
						for (int i = 0; i < businesses.size(); i++)
						{
							Map<String, Object> shop = (Map<String, Object>) businesses.get(i);
							double lat = (double) shop.get("latitude");
							double lon = (double) shop.get("longitude");
							//String url=(String)shop.get("business_url");
							String name=(String)shop.get("name");
							String branch_name=(String)shop.get("branch_name");
							JSONArray Json_categories=(JSONArray)shop.get("categories");
							String categories;
							if(Json_categories.size()>0){
								categories=Json_categories.get(0).toString();
							}else{
								categories="";
							}
							String region;
							JSONArray json_region=(JSONArray)shop.get("regions");
							if(json_region.size()>0){
								region=json_region.get(0).toString();
								if(json_region.size()>1){
									region+=json_region.get(1).toString();
								}
							}else{
								region="";
							}
							String address=(String)shop.get("address");
							double avg_rating=(double)shop.get("avg_rating");
							int avg_price=(int) shop.get("avg_price");
							int review_count=(int) shop.get("review_count");
							double product_score=(double) shop.get("product_score");
							double decoration_score=(double) shop.get("decoration_score");
							double service_score=(double) shop.get("service_score");

							printWriter.println(shopsIndex+","+name+","+branch_name+","+lat+","+lon+","+categories+","+avg_rating+","+avg_price+","+review_count+","+product_score+","+decoration_score+","+service_score+","+region+","+address);
							shopsIndex++;
						}
					}else{
						System.out.println(content);
					}

					//JSONValue.paparseStrict(content);
					//System.out.println("Response content: " + obj.toString());

					//System.out.println("Response content: " + EntityUtils.toString(entity));
				}  
				System.out.println("------------------------------------");

			}finally {  
				response.close();  
			}  
		} catch (ClientProtocolException e) {  
			e.printStackTrace();  
		} catch (IOException e) {  
			e.printStackTrace();  
		} finally { 
			// 关闭连接,释放资源    
			try {  
				httpclient.close();  
			} catch (IOException e) {  
				e.printStackTrace();  
			}  
		}
		printWriter.close();
	}
	

    
    //获取全部的团购ID列表
    public static List getAllDealIdList(String city) throws IOException{
    	List<String> Total_Idlist=new ArrayList(); ;
    	PrintWriter printWriter = new PrintWriter(new FileWriter(new File("D:/自学/大众点评/Data/SH_DianPingAllDealIdList2016.txt"), true));
    	String apiUrl="http://api.dianping.com/v1/deal/get_all_id_list?";
		String appKey = " ";    
		String secret = " ";
		Map<String, String> paramMap = new HashMap<String, String>();
		paramMap.put("city",city);
		StringBuilder stringBuilder = new StringBuilder();
		// 对参数名进行字典排序
		String[] keyArray = paramMap.keySet().toArray(new String[0]);
		Arrays.sort(keyArray);
		// 拼接有序的参数名-值串
		stringBuilder.append(appKey);
		for (String key : keyArray)
		{
			stringBuilder.append(key).append(paramMap.get(key));
		}
		String codes = stringBuilder.append(secret).toString();
		// SHA-1编码， 这里使用的是Apache-codec，即可获得签名(shaHex()会首先将中文转换为UTF8编码然后进行sha1计算，使用其他的工具包请注意UTF8编码转换)
		String sign = org.apache.commons.codec.digest.DigestUtils.shaHex(codes).toUpperCase();	       
		// 添加签名
		stringBuilder = new StringBuilder(); 
		stringBuilder.append("appkey=").append(appKey).append("&sign=").append(sign);
		for (Entry<String, String> entry : paramMap.entrySet())
		{
			stringBuilder.append('&').append(entry.getKey()).append('=').append(entry.getValue());
		}
		String queryString = stringBuilder.toString();
		apiUrl="http://api.dianping.com/v1/deal/get_all_id_list?"+queryString;
		CloseableHttpClient httpclient = HttpClients.createDefault();  
		try {  
			// 创建httpget.    
			HttpGet httpget = new HttpGet(apiUrl);  
			System.out.println("executing request " + httpget.getURI());  
			// 执行get请求.    
			CloseableHttpResponse response = httpclient.execute(httpget);  
			try {  
				// 获取响应实体    
				HttpEntity entity = response.getEntity();  
				System.out.println("--------------------------------------");  
				// 打印响应状态    
				System.out.println(response.getStatusLine());  
				if (entity != null) {  
					// 打印响应内容长度    
					System.out.println("Response content length: " + entity.getContentLength());  
					// 打印响应内容    
					Map<String, Object> map = null;
					String content=EntityUtils.toString(entity);
					try
					{
						map = (Map<String, Object>) JSONValue.parseStrict(content);
					}
					catch (ParseException e)
					{
						// TODO 自动生成的 catch 块
						e.printStackTrace();
					}

					//Object obj=JSONValue.parse(content);
					String status= (String) map.get("status");                 
					if (status.equals("OK"))
					{
						int index=0;
						JSONArray total_ids = (JSONArray) map.get("id_list");
						for(int i=0;i<total_ids.size();i++){
							String  id=total_ids.get(i).toString();
							Total_Idlist.add(id);
							printWriter.println(id);
						}
						printWriter.close();
						return Total_Idlist;					
					}
				}
			}finally {  
				response.close();  
			}  
		} catch (ClientProtocolException e) {  
			e.printStackTrace();  
		} catch (IOException e) {  
			e.printStackTrace();  
		} finally { 
			// 关闭连接,释放资源    
			try {  
				httpclient.close();  
			} catch (IOException e) {  
				e.printStackTrace();  
			}  
		}
		return Total_Idlist;
    	
    }
    
    //根据团购ID,全部的商家ID
    public static List getAllBusinessIdList(String city) throws IOException{
    	PrintWriter printWriter = new PrintWriter(new FileWriter(new File("D:/自学/大众点评/Data/2016/SH_DianPingAllBusinessIdList2016.txt"), true));
    	List<String> bidlist=new ArrayList();
		//List<String> idlist=new ArrayList();
		String dealsString="";
		try {
             String encoding="GBK";
             File file=new File("D:/自学/大众点评/Data/1-shanghai-20160119.json");
             if(file.isFile() && file.exists()){ //判断文件是否存在
                 InputStreamReader read = new InputStreamReader(new FileInputStream(file),encoding);//考虑到编码格式
                 BufferedReader bufferedReader = new BufferedReader(read);
                 String lineTxt = null;
                 int TagIndex=0;
                 
                 while((lineTxt = bufferedReader.readLine()) != null){         
                	 dealsString+=lineTxt; 
                 }
                 read.close();
		     }else{
		         System.out.println("找不到指定的文件");
		     }
	     } catch (Exception e) {
	         System.out.println("读取文件内容出错");
	         e.printStackTrace();
	     }
		Map<String, Object> data=(Map<String, Object>) JSONValue.parse(dealsString);
		JSONArray idlist=(JSONArray) data.get("id_list");
		System.out.println(idlist.size());
		//idlist=getAllDealIdList(city);
		int start=0;
		for(int cindex=311518;cindex<idlist.size();cindex++){
			System.out.println(cindex);
			if(cindex%10001==0){
				try
				{
	    			if(start==0){
	    				start+=1;
	    			}else{
	    				Thread.sleep(600000);
	    			}
					
				}
				catch (InterruptedException e1)
				{
					// TODO 自动生成的 catch 块
					e1.printStackTrace();
				}
			}
			String apiUrl;
			String appKey = " ";    
			String secret = " ";
			Map<String, String> paramMap = new HashMap<String, String>();
			String deal_ids="";
			for(int j=0;j<40;j++){
				if(j!=39&&(cindex+j<idlist.size()-1)){
					//System.out.println(cindex+j);
					deal_ids+=idlist.get(cindex+j)+",";
				}else{
					
					deal_ids+=idlist.get(cindex+j);
					break;
				}
			}
			cindex+=39;
			//System.out.println(deal_ids);
			paramMap.put("deal_ids",deal_ids);  
			StringBuilder stringBuilder = new StringBuilder();
			// 对参数名进行字典排序
			String[] keyArray = paramMap.keySet().toArray(new String[0]);
			Arrays.sort(keyArray);
			// 拼接有序的参数名-值串
			stringBuilder.append(appKey);
			for (String key : keyArray)
			{
				stringBuilder.append(key).append(paramMap.get(key));
			}
			String codes = stringBuilder.append(secret).toString();
			// SHA-1编码， 这里使用的是Apache-codec，即可获得签名(shaHex()会首先将中文转换为UTF8编码然后进行sha1计算，使用其他的工具包请注意UTF8编码转换)
			String sign = org.apache.commons.codec.digest.DigestUtils.shaHex(codes).toUpperCase();	       
			// 添加签名
			stringBuilder = new StringBuilder(); 
			stringBuilder.append("appkey=").append(appKey).append("&sign=").append(sign);
			for (Entry<String, String> entry : paramMap.entrySet())
			{
				stringBuilder.append('&').append(entry.getKey()).append('=').append(entry.getValue());
			}
			String queryString = stringBuilder.toString();	        
			apiUrl="http://api.dianping.com/v1/deal/get_batch_deals_by_id?"+queryString;
			CloseableHttpClient httpclient = HttpClients.createDefault();  
			try {  
				// 创建httpget.    
				HttpGet httpget = new HttpGet(apiUrl);  
				//System.out.println("executing request " + httpget.getURI());  
				// 执行get请求.    
				CloseableHttpResponse response = httpclient.execute(httpget);  
				try {  
					// 获取响应实体    
					HttpEntity entity = response.getEntity();  
					//System.out.println("--------------------------------------");  
					// 打印响应状态    
					System.out.println(response.getStatusLine());  
					if (entity != null) {  
						// 打印响应内容长度    
						//System.out.println("Response content length: " + entity.getContentLength());  
						// 打印响应内容    
						Map<String, Object> map = null;
						String content=EntityUtils.toString(entity);
						//System.out.println(content);
						//try
						//{
							map = (Map<String, Object>) JSONValue.parse(content);
						//}
//						catch (ParseException e)
//						{
//							// TODO 自动生成的 catch 块
//							e.printStackTrace();
//						}

						//Object obj=JSONValue.parse(content);
						String status= (String) map.get("status");							                 
						if (status.equals("OK"))
						{
							int count=(int)map.get("count");
							System.out.println(count); 
							JSONArray deals = (JSONArray) map.get("deals");
							//System.out.println(deals);
							for (int i = 0; i < deals.size(); i++)
							{
								Map<String, Object> deal = (Map<String, Object>) deals.get(i);
								JSONArray shops=(JSONArray)deal.get("businesses");
								System.out.println(shops.size());
								for(int k=0;k<shops.size();k++){
									Map<String,Object> shop=(Map<String, Object>)shops.get(k);
									String bid=shop.get("id").toString();
									printWriter.println(bid);
									bidlist.add(bid);
								}
							}
						}else{
							System.out.println(content);
						}

						//JSONValue.paparseStrict(content);
						//System.out.println("Response content: " + obj.toString());

						//System.out.println("Response content: " + EntityUtils.toString(entity));
					}  
					System.out.println("------------------------------------");

				}finally {  
					response.close();  
				}  
			} catch (ClientProtocolException e) {  
				e.printStackTrace();  
			} catch (IOException e) {  
				e.printStackTrace();  
			} finally { 
				// 关闭连接,释放资源    
				try {  
					httpclient.close();  
				} catch (IOException e) {  
					e.printStackTrace();  
				}  
			}
		}
		return bidlist;
    }
    
    /* 组装商家id，40个一次的去请求信息
     * 
     */
    public static void getShopInfo()throws IOException{
		List<String> idlist=new ArrayList();
		//idlist=getAllBusinessIdList("上海");
		try {
             String encoding="GBK";
             File file=new File("D:/自学/大众点评/Data/2016/SH_DianPingAllBusinessIdList2016.txt");
             if(file.isFile() && file.exists()){ //判断文件是否存在
                 InputStreamReader read = new InputStreamReader(new FileInputStream(file),encoding);//考虑到编码格式
                 BufferedReader bufferedReader = new BufferedReader(read);
                 String lineTxt = null;
                 int TagIndex=0;
                 String busids="";
                 while((lineTxt = bufferedReader.readLine()) != null){
                    System.out.println(lineTxt);
                    if(TagIndex!=39){
                    	busids+=lineTxt.trim()+",";
                    }else{
                    	busids+=lineTxt;
                    	TagIndex=0;
                    	getBusInfoByIds(busids);
                    	busids="";
                    }
                    TagIndex++;
                 }
                 read.close();
		     }else{
		         System.out.println("找不到指定的文件");
		     }
		     } catch (Exception e) {
		         System.out.println("读取文件内容出错");
		         e.printStackTrace();
		     }
    }
    
    
    
    
    
    
    
    /*根据区域 分类 搜索商家信息 
     * 问题是 会被限制请求次数，而且不能太快
     */
    public static void searchShop() throws IOException{


    	PrintWriter printWriter = new PrintWriter(new FileWriter(new File("D:/自学/大众点评/Data/2016/SH_DianPingAllShop2016search.txt"), true));
    	List carray=getCategories("上海");
    	List regions=getRegions("上海");
    	int start=0;
    	for(int cindex=0;cindex<carray.size()&&!carray.get(cindex).equals("COSTA COFFEE");cindex++){

    		
    		String apiUrl;
			String appKey = " ";    
			String secret = " ";
			Map<String, String> paramMap = new HashMap<String, String>();
			paramMap.put("city", "上海");
			paramMap.put("category", (String) carray.get(cindex));
			paramMap.put("limit", "40");
			paramMap.put("out_offset_type", "1");    //传出经纬度偏移类型，1:高德坐标系偏移，2:图吧坐标系偏移，如不传入，默认值为1
			//paramMap.put("has_deal", "1");       //根据是否有团购来筛选返回的商户，1:有，0:没有
			//paramMap.put("keyword", "火锅");      
			//paramMap.put("sort", "7");           //结果排序，1:默认，2:星级高优先，3:产品评价高优先，4:环境评价高优先，5:服务评价高优先，6:点评数量多优先，8:人均价格低优先，9：人均价格高优先
			paramMap.put("format", "json");
			paramMap.put("page","1");
			//paramMap.put("latitude", "31.21524");//上海  31.21524 121.420033 武汉3 0.512583 114.364715
			//paramMap.put("longitude", "121.420033");
			//paramMap.put("radius", "5000");
			//paramMap.put("has_coupon", "1");   //根据是否有优惠券来筛选返回的商户，1:有，0:没有
			for(int regionIndex=0;regionIndex<regions.size();regionIndex++){
				int requestNum=cindex*regions.size()+regionIndex;
				System.out.println(requestNum);
				if(requestNum<60000){
					continue;
				}
				if(requestNum%100==0){
					try
					{
		    			if(start==0){
		    				start+=1;
		    			}else{
		    				
		    				Thread.sleep(25000);
		    			}
						
					}
					catch (InterruptedException e1)
					{
						// TODO 自动生成的 catch 块
						e1.printStackTrace();
					}
				}
				System.out.println(regions.get(regionIndex));
				if(paramMap.get("region")!=null){
					paramMap.remove("region");
				}
				paramMap.put("region",(String)regions.get(regionIndex));	        
				StringBuilder stringBuilder = new StringBuilder();
				// 对参数名进行字典排序
				String[] keyArray = paramMap.keySet().toArray(new String[0]);
				Arrays.sort(keyArray);
				// 拼接有序的参数名-值串
				stringBuilder.append(appKey);
				for (String key : keyArray)
				{
					stringBuilder.append(key).append(paramMap.get(key));
				}
				String codes = stringBuilder.append(secret).toString();
				// SHA-1编码， 这里使用的是Apache-codec，即可获得签名(shaHex()会首先将中文转换为UTF8编码然后进行sha1计算，使用其他的工具包请注意UTF8编码转换)
				String sign = org.apache.commons.codec.digest.DigestUtils.shaHex(codes).toUpperCase();	       
				// 添加签名
				stringBuilder = new StringBuilder(); 
				stringBuilder.append("appkey=").append(appKey).append("&sign=").append(sign);
				for (Entry<String, String> entry : paramMap.entrySet())
				{
					stringBuilder.append('&').append(entry.getKey()).append('=').append(entry.getValue());
				}
				String queryString = stringBuilder.toString();	        
				apiUrl="http://api.dianping.com/v1/business/find_businesses_by_region?"+queryString;
				CloseableHttpClient httpclient = HttpClients.createDefault();  
				try {  
					// 创建httpget.    
					HttpGet httpget = new HttpGet(apiUrl);  
					System.out.println("executing request " + httpget.getURI());  
					// 执行get请求.    
					CloseableHttpResponse response = httpclient.execute(httpget);  
					try {  
						// 获取响应实体    
						HttpEntity entity = response.getEntity();  
						System.out.println("--------------------------------------");  
						// 打印响应状态    
						System.out.println(response.getStatusLine());  
						if (entity != null) {  
							// 打印响应内容长度    
							System.out.println("Response content length: " + entity.getContentLength());  
							// 打印响应内容    
							Map<String, Object> map = null;
							String content=EntityUtils.toString(entity);
							try
							{
								map = (Map<String, Object>) JSONValue.parseStrict(content);
							}
							catch (ParseException e)
							{
								// TODO 自动生成的 catch 块
								e.printStackTrace();
							}
	
							//Object obj=JSONValue.parse(content);
							String status= (String) map.get("status");							                 
							if (status.equals("OK"))
							{
								int count=(int)map.get("count");
								int total_count=(int)map.get("total_count");
								System.out.println(total_count);	
								System.out.println(count); 
								JSONArray shops = (JSONArray) map.get("businesses");
								System.out.println(shops);
	
								for (int i = 0; i < shops.size(); i++)
								{
									
									Map<String, Object> shop = (Map<String, Object>) shops.get(i);
									double lat = (double) shop.get("latitude");
									double lon = (double) shop.get("longitude");
									String url=(String)shop.get("business_url");
									String name=(String)shop.get("name");
									String branch_name=(String)shop.get("branch_name");
									JSONArray Json_categories=(JSONArray)shop.get("categories");
									String categories;
									if(Json_categories.size()>0){
										categories=Json_categories.get(0).toString();
									}else{
										categories="";
									}
									String region;
									JSONArray json_region=(JSONArray)shop.get("regions");
									if(json_region.size()>0){
										region=json_region.get(0).toString();
										if(json_region.size()>1){
											region+=json_region.get(1).toString();
										}
									}else{
										region="";
									}
									String address=(String)shop.get("address");
									double avg_rating=(double)shop.get("avg_rating");
									int avg_price=(int)shop.get("avg_price");
									int review_count =(int)shop.get("review_count");
									double product_score=(double) shop.get("product_score");
									double decoration_score=(double) shop.get("decoration_score");
									double service_score=(double) shop.get("service_score");
									printWriter.println(shopsIndex+","+name+","+branch_name+","+lat+","+lon+","+categories+","+avg_rating+","+avg_price+","+review_count+","+product_score+","+decoration_score+","+service_score+","+region+","+address);
									shopsIndex++;
								}
							}else{
								System.out.println(content);
							}
	
							//JSONValue.paparseStrict(content);
							//System.out.println("Response content: " + obj.toString());
	
							//System.out.println("Response content: " + EntityUtils.toString(entity));
						}  
						System.out.println("------------------------------------");
	
					}finally {  
						response.close();  
					}  
				} catch (ClientProtocolException e) {  
					e.printStackTrace();  
				} catch (IOException e) {  
					e.printStackTrace();  
				}  finally { 
					// 关闭连接,释放资源    
					try {  
						httpclient.close();  
					} catch (IOException e) {  
						e.printStackTrace();  
					}  
				}
			}
		}
    	printWriter.close();
    }
	/*
	 * 获取支持商户搜索的分类列表
	 */
    public static List getCategories(String city) throws IOException{
    	List<String> Total_Categories=new ArrayList(); ;
    	PrintWriter printWriter = new PrintWriter(new FileWriter(new File("D:/自学/大众点评/Data/SH_DianPingCategories.txt"), true));
    	String apiUrl="http://api.dianping.com/v1/metadata/get_categories_with_businesses?";
		String appKey = " ";    
		String secret = " ";
		Map<String, String> paramMap = new HashMap<String, String>();
		paramMap.put("city",city);
		StringBuilder stringBuilder = new StringBuilder();
		// 对参数名进行字典排序
		String[] keyArray = paramMap.keySet().toArray(new String[0]);
		Arrays.sort(keyArray);
		// 拼接有序的参数名-值串
		stringBuilder.append(appKey);
		for (String key : keyArray)
		{
			stringBuilder.append(key).append(paramMap.get(key));
		}
		String codes = stringBuilder.append(secret).toString();
		// SHA-1编码， 这里使用的是Apache-codec，即可获得签名(shaHex()会首先将中文转换为UTF8编码然后进行sha1计算，使用其他的工具包请注意UTF8编码转换)
		String sign = org.apache.commons.codec.digest.DigestUtils.shaHex(codes).toUpperCase();	       
		// 添加签名
		stringBuilder = new StringBuilder(); 
		stringBuilder.append("appkey=").append(appKey).append("&sign=").append(sign);
		for (Entry<String, String> entry : paramMap.entrySet())
		{
			stringBuilder.append('&').append(entry.getKey()).append('=').append(entry.getValue());
		}
		String queryString = stringBuilder.toString();
		apiUrl="http://api.dianping.com/v1/metadata/get_categories_with_businesses?"+queryString;
		CloseableHttpClient httpclient = HttpClients.createDefault();  
		try {  
			// 创建httpget.    
			HttpGet httpget = new HttpGet(apiUrl);  
			System.out.println("executing request " + httpget.getURI());  
			// 执行get请求.    
			CloseableHttpResponse response = httpclient.execute(httpget);  
			try {  
				// 获取响应实体    
				HttpEntity entity = response.getEntity();  
				System.out.println("--------------------------------------");  
				// 打印响应状态    
				System.out.println(response.getStatusLine());  
				if (entity != null) {  
					// 打印响应内容长度    
					System.out.println("Response content length: " + entity.getContentLength());  
					// 打印响应内容    
					Map<String, Object> map = null;
					String content=EntityUtils.toString(entity);
					try
					{
						map = (Map<String, Object>) JSONValue.parseStrict(content);
					}
					catch (ParseException e)
					{
						// TODO 自动生成的 catch 块
						e.printStackTrace();
					}

					//Object obj=JSONValue.parse(content);
					String status= (String) map.get("status");                 
					if (status.equals("OK"))
					{
						int index=0;
						JSONArray total_categories = (JSONArray) map.get("categories");
						for(int i=0;i<total_categories.size();i++){
							Map<String, Object> categories=(Map<String, Object>)total_categories.get(i);
							String category_name=(String)categories.get("category_name");  //美食、购物、...
							JSONArray subcategories1=(JSONArray)categories.get("subcategories");
							for(int j=0;j<subcategories1.size();j++){
								Map<String, Object> subcategories2=(Map<String, Object>)subcategories1.get(j);
								String subcategories2_name=(String)subcategories2.get("category_name");  //江浙菜、川菜...
								JSONArray subcategories3=(JSONArray)subcategories2.get("subcategories");
								for(int k=0;k<subcategories3.size();k++){
									String subcategories3_name=subcategories3.get(k).toString().trim();
									subcategories3_name=subcategories3_name.replace(" ","");
									printWriter.println(subcategories3_name);
									Total_Categories.add(subcategories3_name);
									System.out.println(subcategories3_name);
									
								}
							}
						}
						printWriter.close();
						return Total_Categories;					
					}
				}
			}finally {  
				response.close();  
			}  
		} catch (ClientProtocolException e) {  
			e.printStackTrace();  
		} catch (IOException e) {  
			e.printStackTrace();  
		} finally { 
			// 关闭连接,释放资源    
			try {  
				httpclient.close();  
			} catch (IOException e) {  
				e.printStackTrace();  
			}  
		}
		return Total_Categories;	
    }
    
	/*
	 * 获取支持商户搜索的城市区域列表
	 */
    public static List getRegions(String city) throws IOException{
    	List<String> Total_Regions=new ArrayList(); ;
    	PrintWriter printWriter = new PrintWriter(new FileWriter(new File("D:/自学/大众点评/Data/SH_DianPingRegions.txt"), true));
    	String apiUrl="http://api.dianping.com/v1/metadata/get_regions_with_businesses?";
		String appKey = " ";    
		String secret = " ";
		Map<String, String> paramMap = new HashMap<String, String>();
		paramMap.put("city",city);
		StringBuilder stringBuilder = new StringBuilder();
		// 对参数名进行字典排序
		String[] keyArray = paramMap.keySet().toArray(new String[0]);
		Arrays.sort(keyArray);
		// 拼接有序的参数名-值串
		stringBuilder.append(appKey);
		for (String key : keyArray)
		{
			stringBuilder.append(key).append(paramMap.get(key));
		}
		String codes = stringBuilder.append(secret).toString();
		// SHA-1编码， 这里使用的是Apache-codec，即可获得签名(shaHex()会首先将中文转换为UTF8编码然后进行sha1计算，使用其他的工具包请注意UTF8编码转换)
		String sign = org.apache.commons.codec.digest.DigestUtils.shaHex(codes).toUpperCase();	       
		// 添加签名
		stringBuilder = new StringBuilder(); 
		stringBuilder.append("appkey=").append(appKey).append("&sign=").append(sign);
		for (Entry<String, String> entry : paramMap.entrySet())
		{
			stringBuilder.append('&').append(entry.getKey()).append('=').append(entry.getValue());
		}
		String queryString = stringBuilder.toString();
		apiUrl="http://api.dianping.com/v1/metadata/get_regions_with_businesses?"+queryString;
		CloseableHttpClient httpclient = HttpClients.createDefault();  
		try {  
			// 创建httpget.    
			HttpGet httpget = new HttpGet(apiUrl);  
			System.out.println("executing request " + httpget.getURI());  
			// 执行get请求.    
			CloseableHttpResponse response = httpclient.execute(httpget);  
			try {  
				// 获取响应实体    
				HttpEntity entity = response.getEntity();  
				System.out.println("--------------------------------------");  
				// 打印响应状态    
				System.out.println(response.getStatusLine());  
				if (entity != null) {  
					// 打印响应内容长度    
					System.out.println("Response content length: " + entity.getContentLength());  
					// 打印响应内容    
					Map<String, Object> map = null;
					String content=EntityUtils.toString(entity);
					try
					{
						map = (Map<String, Object>) JSONValue.parseStrict(content);
					}
					catch (ParseException e)
					{
						// TODO 自动生成的 catch 块
						e.printStackTrace();
					}

					//Object obj=JSONValue.parse(content);
					String status= (String) map.get("status");                 
					if (status.equals("OK"))
					{
						int index=0;
						JSONArray total_citys = (JSONArray) map.get("cities");
						for(int i=0;i<total_citys.size();i++){
							Map<String, Object> cityObj=(Map<String, Object>) total_citys.get(i);
							JSONArray districts=(JSONArray)cityObj.get("districts");
							for(int j=0;j<districts.size();j++){
								Map<String, Object> regionsObj=(Map<String, Object>) districts.get(j);
								JSONArray regions=(JSONArray) regionsObj.get("neighborhoods");
								for(int r=0;r<regions.size();r++){
									String regionname=regions.get(r).toString().trim();
									regionname=regionname.replace(" ","");
									printWriter.println(regionname);
									Total_Regions.add(regionname);
									System.out.println(regionname);
								}
							}
						}
					}
					printWriter.close();
					return Total_Regions;	
				}

			}finally {  
				response.close();  
			}  
		} catch (ClientProtocolException e) {  
			e.printStackTrace();  
		} catch (IOException e) {  
			e.printStackTrace();  
		} finally { 
			// 关闭连接,释放资源    
			try {  
				httpclient.close();  
			} catch (IOException e) {  
				e.printStackTrace();  
			}  
		}
		return Total_Regions;
    }
}
