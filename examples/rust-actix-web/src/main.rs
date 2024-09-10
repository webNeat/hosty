use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
use serde::Serialize;

#[derive(Serialize)]
struct GreetResponse {
    hello: String,
}

#[derive(Serialize)]
struct FibonacciResponse {
    value: u64,
}

#[get("/greet/{name}")]
async fn greet(name: web::Path<String>) -> impl Responder {
    let response = GreetResponse { hello: name.clone() };
    HttpResponse::Ok().json(response)
}

#[get("/fibonacci/{n}")]
async fn fibonacci(n: web::Path<u64>) -> impl Responder {
    let n = n.into_inner();
    if n == 0 {
        return HttpResponse::Ok().json(&FibonacciResponse { value: 0 });
    } else if n == 1 {
        return HttpResponse::Ok().json(&FibonacciResponse { value: 1 });
    }

    let mut a = 1;
    let mut b = 1;
    for _ in 2..n {
        let c = a + b;
        a = b;
        b = c;
    }

    HttpResponse::Ok().json(&FibonacciResponse { value: b })
}

fn port() -> u16 {
    std::env::var("PORT")
        .map(|port| port.parse().expect("PORT must be a valid integer"))
        .unwrap_or(80)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(greet)
            .service(fibonacci)
    })
    .bind(("0.0.0.0", port()))?
    .run()
    .await
}