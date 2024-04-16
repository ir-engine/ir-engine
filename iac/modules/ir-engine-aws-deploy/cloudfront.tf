data "aws_cloudfront_cache_policy" "caching_optimized_cache_policy" {
  name = "Managed-CachingOptimized"
}

data "aws_cloudfront_origin_request_policy" "s3_origin_request_policy" {
  name = "Managed-CORS-S3Origin"
}

resource "aws_cloudfront_response_headers_policy" "response_headers_policy" {
  name    = "${aws_s3_bucket.s3_bucket.id}-response-policy"
  comment = "Response headers policy for ${aws_s3_bucket.s3_bucket.id}"

  cors_config {
    access_control_allow_headers {
      items = ["*"]
    }
    access_control_allow_methods {
      items = ["ALL"]
    }
    access_control_allow_origins {
      items = ["*"]
    }
    access_control_expose_headers {
      items = ["*"]
    }
    access_control_allow_credentials = false
    access_control_max_age_sec       = 600
    origin_override                  = true
  }
}

resource "aws_cloudfront_origin_access_control" "s3_origin_access" {
  name                              = aws_s3_bucket.s3_bucket.bucket_regional_domain_name
  description                       = "origin access for ${aws_s3_bucket.s3_bucket.id}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "assets_cdn" {
  enabled = true
  comment = "${aws_s3_bucket.s3_bucket.id} CDN"
  default_root_object = "client/index.html"
  origin {
    origin_id                = "${var.app_name}-${aws_s3_bucket.s3_bucket.id}-s3"
    domain_name              = aws_s3_bucket.s3_bucket.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.s3_origin_access.id
    # origin_path = "/"
    connection_attempts = 3
    connection_timeout  = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "blacklist"
      locations = [
        "CN", "KP", "RU"
      ]
    }
  }

  default_cache_behavior {
    allowed_methods            = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods             = ["HEAD", "GET", "OPTIONS"]
    target_origin_id           = "${var.app_name}-${aws_s3_bucket.s3_bucket.id}-s3"
    cache_policy_id            = data.aws_cloudfront_cache_policy.caching_optimized_cache_policy.id
    origin_request_policy_id   = data.aws_cloudfront_origin_request_policy.s3_origin_request_policy.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.response_headers_policy.id
    viewer_protocol_policy     = "redirect-to-https"
  }

  aliases = ["ir-engine-${var.environment}.theinfinitereality.io"]
  viewer_certificate {
      acm_certificate_arn      = var.acm_cert_arn
      ssl_support_method       = "sni-only"
      minimum_protocol_version = "TLSv1.2_2021"
      # cloudfront_default_certificate = true
  }

  tags = var.default_tags
}

