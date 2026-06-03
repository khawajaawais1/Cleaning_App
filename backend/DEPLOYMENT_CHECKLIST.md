# Happy2Clean API - Deployment Checklist

## Pre-Deployment

- [ ] Update JWT secret key in appsettings.json (move to User Secrets or Azure Key Vault)
- [ ] Update database connection string for production SQL Server
- [ ] Update CORS allowed origins for production domain
- [ ] Review and update all email addresses in code
- [ ] Verify API port configuration (default: 5001)
- [ ] Set up SSL certificate
- [ ] Configure environment variables
- [ ] Enable HTTPS redirection in production

## Database Preparation

- [ ] Create production SQL Server database
- [ ] Verify database user has appropriate permissions
- [ ] Test database connection string
- [ ] Run migrations: `dotnet ef database update`
- [ ] Verify data seeding completed successfully
- [ ] Create database backups
- [ ] Configure automated backup schedule

## Application Build & Test

- [ ] `dotnet restore` - Install all NuGet packages
- [ ] `dotnet build` - Verify no compilation errors
- [ ] `dotnet run` - Test locally
- [ ] Test all API endpoints via Swagger UI
- [ ] Verify JWT token generation and validation
- [ ] Test authentication flow (login, refresh, current user)
- [ ] Test all CRUD operations (create, read, update, delete)
- [ ] Verify error handling and error responses
- [ ] Test CORS configuration
- [ ] Load test API endpoints

## Security Review

- [ ] All endpoints (except /login and /refresh) require [Authorize]
- [ ] Passwords are hashed with BCrypt
- [ ] JWT tokens have appropriate expiration
- [ ] SQL injection protection verified (EF Core)
- [ ] Cross-site scripting (XSS) protection verified
- [ ] CORS origins are restricted
- [ ] No sensitive data in error messages
- [ ] No hardcoded secrets in source code
- [ ] API keys and secrets in secure storage
- [ ] HTTPS enforced in production

## Monitoring & Logging

- [ ] Configure logging levels for production
- [ ] Set up centralized logging (e.g., Application Insights, ELK)
- [ ] Configure error tracking (e.g., Sentry, Application Insights)
- [ ] Set up performance monitoring
- [ ] Configure database query logging
- [ ] Implement health check endpoint
- [ ] Set up alerts for critical errors

## Infrastructure

- [ ] Web hosting configured (IIS, Docker, Azure App Service, etc.)
- [ ] Load balancer configured if needed
- [ ] CDN configured if needed
- [ ] SSL certificate installed and valid
- [ ] Firewall rules configured
- [ ] API rate limiting configured (optional)
- [ ] DDoS protection enabled

## DevOps & CI/CD

- [ ] Source code in version control (Git)
- [ ] CI/CD pipeline configured (GitHub Actions, Azure DevOps, etc.)
- [ ] Automated testing enabled
- [ ] Code coverage monitoring
- [ ] Automated deployment process
- [ ] Rollback plan documented
- [ ] Deployment documentation updated

## Documentation

- [ ] API documentation updated in Swagger/OpenAPI
- [ ] README.md current and accurate
- [ ] Architecture documentation complete
- [ ] Database schema documented
- [ ] Deployment guide created
- [ ] Troubleshooting guide created
- [ ] Team training completed

## Post-Deployment

- [ ] API endpoints accessible in production
- [ ] Database connectivity verified
- [ ] Authentication working in production
- [ ] All features tested in production
- [ ] Performance monitoring active
- [ ] Error logging working
- [ ] Backups verified
- [ ] Monitoring alerts active
- [ ] Team aware of production environment
- [ ] Incident response plan ready

## Optional Enhancements

- [ ] API versioning (v1, v2, etc.)
- [ ] Request/response compression (gzip)
- [ ] API caching (Redis)
- [ ] Database query caching
- [ ] Message queue integration (RabbitMQ, Service Bus)
- [ ] Scheduled jobs (Hangfire, Quartz)
- [ ] Real-time updates (SignalR)
- [ ] GraphQL endpoint
- [ ] OpenID Connect / OAuth integration
- [ ] API analytics and usage tracking

## Rollback Plan

If issues occur after deployment:

1. Keep previous version running
2. Point traffic back to previous version
3. Investigate root cause
4. Fix and re-test locally
5. Deploy fix to staging
6. Verify thoroughly
7. Deploy to production again

## Contact & Support

- Primary Contact: [Name/Team]
- Email: [support email]
- On-Call: [On-call contact]
- Escalation: [Escalation contact]

## Sign-Off

- [ ] Developer: _____________ Date: _______
- [ ] QA Lead: _____________ Date: _______
- [ ] DevOps: _____________ Date: _______
- [ ] Product Owner: _____________ Date: _______
